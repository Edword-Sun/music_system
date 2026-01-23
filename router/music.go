package router

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/dhowden/tag"
	"github.com/gin-gonic/gin"

	"music_system/model"
	"music_system/router/check"
	"music_system/router/handler"
	"music_system/service"
	"music_system/tool"
	"music_system/tool/filter"
	"music_system/tool/music_storage_path"
)

type MusicHandler struct {
	musicService    *service.MusicService
	streamerService *service.StreamerService
}

func NewMusicHandler(
	musicService *service.MusicService,
	streamerService *service.StreamerService) *MusicHandler {
	return &MusicHandler{
		musicService:    musicService,
		streamerService: streamerService,
	}
}

func (h *MusicHandler) Init(engine *gin.Engine) {
	g := engine.Group("/music")
	{
		g.POST("/find", h.FindMusic)
		g.POST("/list", h.ListMusic)

		g.POST("/add", h.CreateMusic)
		g.PUT("/update", h.UpdateMusic)
		g.DELETE("/delete", h.DeleteMusic)
	}

}

func (h *MusicHandler) ListMusic(c *gin.Context) {
	var condition filter.ListMusic
	err := c.ShouldBindJSON(&condition)
	if err != nil {
		log.Println("参数错误")
		c.JSON(http.StatusOK, tool.Response{
			Message: "参数错误",
			Body:    nil,
		})
		return
	}

	offset := (condition.Page - 1) * condition.Size

	data, total, err := h.musicService.ListMusics(offset, condition.Size)
	if err != nil {
		fmt.Println("list music 错误", err)
		c.JSON(http.StatusOK, tool.Response{
			Message: "list music 错误",
			Body:    gin.H{"error": err.Error()},
		})
		return
	}

	c.JSON(http.StatusOK, tool.Response{
		Message: "list music 成功",
		Body: gin.H{
			"total": total,
			"data":  data,
		},
	})
}

func (h *MusicHandler) FindMusic(c *gin.Context) {
	var data model.Music
	err := c.ShouldBindJSON(&data)
	if err != nil {
		fmt.Println("参数错误: ", err)
		c.JSON(http.StatusOK, tool.Response{
			Message: "参数错误",
			Body:    nil,
		})
		return
	}

	var getMusic *model.Music
	err, getMusic = h.musicService.FindMusic(&data)
	if err != nil {
		fmt.Println("查找错误: ", err)
		c.JSON(http.StatusOK, tool.Response{
			Message: "查找错误",
			Body:    nil,
		})
		return
	}
	if getMusic == nil {
		c.JSON(http.StatusOK, tool.Response{
			Message: "不存在",
			Body:    getMusic,
		})
		return
	}

	c.JSON(http.StatusOK, tool.Response{
		Message: "",
		Body:    getMusic,
	})
}

func (h *MusicHandler) CreateMusic(c *gin.Context) {
	var music model.Music
	if err := c.ShouldBindJSON(&music); err != nil {
		fmt.Println("参数错误: ", err)
		c.JSON(http.StatusOK, tool.Response{
			Message: "参数错误",
			Body: gin.H{
				"error": err,
			},
		})
		return
	}

	err, musicID := h.musicService.CreateMusic(&music)
	if err != nil {
		fmt.Println("创建错误: ", err)
		c.JSON(http.StatusOK, tool.Response{
			Message: "创建错误",
			Body: gin.H{
				"error": err,
			},
		})
		return
	}

	c.JSON(http.StatusOK, tool.Response{
		Message: "",
		Body: gin.H{
			"music_id": musicID,
		},
	})
}
func (h *MusicHandler) UpdateMusic(c *gin.Context) {
	var music model.Music
	if err := c.ShouldBindJSON(&music); err != nil {
		fmt.Println("参数错误")
		c.JSON(http.StatusOK, tool.Response{
			Message: "参数错误",
			Body: gin.H{
				"err": err,
			},
		})
		return
	}

	err := h.musicService.UpdateMusic(&music)
	if err != nil {
		fmt.Println("更新music错误")
		fmt.Println(err)

		c.JSON(http.StatusOK, tool.Response{
			Message: "更新music错误",
			Body:    nil,
		})
		return
	}

	c.JSON(http.StatusOK, tool.Response{
		Message: "更新music成功",
		Body:    nil,
	})
}
func (h *MusicHandler) DeleteMusic(c *gin.Context) {
	var req handler.DeleteMusicReq
	//var resp handler.DeleteMusicResp

	if err := c.ShouldBindJSON(&req); err != nil {
		log.Println("参数错误")
		c.JSON(http.StatusOK, tool.Response{
			Message: "参数错误",
			Body:    err,
		})
		return
	}

	err, music := check.CheckDeleteMusic(&req)
	if err != nil {
		log.Println("校验参数错误")
		c.JSON(http.StatusOK, tool.Response{
			Message: "校验参数错误",
			Body:    err,
		})
		return
	}

	err, exsitMusic := h.musicService.FindMusic(&model.Music{ID: req.ID})
	if err != nil {
		log.Println(err)
		c.JSON(http.StatusOK, tool.Response{
			Message: "查找存在music错误",
			Body:    err,
		})
		return
	}

	// 找streamer并删掉
	eStreamer, err := h.streamerService.FindStreamer(&filter.FindStreamer{
		ID: exsitMusic.StreamerID,
	})
	if err != nil {
		log.Println(err)
		c.JSON(http.StatusOK, tool.Response{
			Message: "通过存在music查找存在streamer错误",
			Body:    err,
		})
		return
	}
	err = h.streamerService.DeleteStreamer(eStreamer.ID)
	if err != nil {
		log.Println(err)
		c.JSON(http.StatusOK, tool.Response{
			Message: "删除streamer错误",
			Body:    err,
		})
	}
	// 删除本地的音乐文件，用streamer的信息去删除
	if eStreamer.StoragePath != "" {
		relPath := eStreamer.StoragePath
		// 安全校验：防止路径穿越
		if !strings.Contains(relPath, "..") && !strings.HasPrefix(relPath, "/") && !strings.HasPrefix(relPath, "\\") {
			fullPath := filepath.Join(music_storage_path.MusicRoot, filepath.FromSlash(relPath))
			if err := os.Remove(fullPath); err != nil && !os.IsNotExist(err) {
				log.Printf("物理删除本地文件失败: %v, path: %s", err, fullPath)
			}
		}
	}

	err = h.musicService.DeleteMusic(&music)
	if err != nil {
		fmt.Println("删除错误: ", err.Error())
		c.JSON(http.StatusOK, tool.Response{
			Message: "删除错误",
			Body: gin.H{
				"err": err,
			},
		})
		return
	}

	log.Println("删除music成功")
	c.JSON(http.StatusOK, tool.Response{
		Message: "删除成功",
		Body:    nil,
	})
}

func (h *MusicHandler) extractMetadata(filePath string) (*model.Music, error) {
	f, err := os.Open(filePath)
	if err != nil {
		return nil, err
	}
	defer f.Close()

	// 自动识别格式并读取标签
	m, err := tag.ReadFrom(f)
	if err != nil {
		return nil, err
	}

	metadata := &model.Music{
		Name:       m.Title(),
		SingerName: m.Artist(),
		Album:      m.Album(),

		//Duration: m.Duration(), // 部分格式支持直接读取时长
	}

	// 甚至可以提取封面图并保存
	// pic := m.Picture()

	return metadata, nil
}
