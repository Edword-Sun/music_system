package router

import (
	"fmt"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"

	"music_system/model"
	"music_system/service"
	"music_system/tool"
	"music_system/tool/filter"
)

type MusicHandler struct {
	musicService *service.MusicService
}

func NewMusicHandler(musicService *service.MusicService) *MusicHandler {
	return &MusicHandler{
		musicService: musicService,
	}
}

func (h *MusicHandler) Init(engine *gin.Engine) {
	g := engine.Group("/music")
	{
		g.GET("/", h.FindMusic)
		g.POST("/list", h.ListMusic)

		g.POST("/", h.CreateMusic)
		g.PUT("/", h.UpdateMusic)
		g.DELETE("/:id", h.DeleteMusic)
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
	musicID := c.Param("id")
	if len(musicID) == 0 {
		c.JSON(http.StatusOK, tool.Response{
			Message: "参数为空",
			Body:    nil,
		})
		return
	}

	var music model.Music
	music.ID = musicID
	err := h.musicService.DeleteMusic(&music)
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

	c.JSON(http.StatusOK, tool.Response{
		Message: "删除成功",
		Body:    nil,
	})
}
