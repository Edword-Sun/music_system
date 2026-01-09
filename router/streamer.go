package router

import (
	"github.com/gin-gonic/gin"
	"log"
	"music_system/model"
	"music_system/router/handler"
	"music_system/service"
	"music_system/tool"
	"music_system/tool/filter"
	"music_system/tool/music_storage_path"
	"net/http"
	"os"
	"path/filepath"
	"strings"
)

//// 模拟数据库（实际项目中替换为你的 DB 查询）
//var mockTrackDB = map[string]string{
//	"123": "a3/a3f8c2b1.mp3",
//	"456": "7b/7b12e9f0.flac",
//}
//
//// 从数据库获取存储路径（替换为你的真实逻辑）
//func getStoragePath(trackID string) (string, error) {
//	if path, exists := mockTrackDB[trackID]; exists {
//		return path, nil
//	}
//	return "", fmt.Errorf("track not found")
//}

type StreamerHandler struct {
	svc *service.StreamerService
}

func NewStreamerHandler(svc *service.StreamerService) *StreamerHandler {
	return &StreamerHandler{svc: svc}
}

func (h *StreamerHandler) Init(e *gin.Engine) {
	g := e.Group("/streamer")
	{
		g.POST("/audio", h.StreamAudio)
		g.POST("/add", h.CreateStreamer)
		//g.POST("/find", h.FindStreamer)
		g.POST("/update", h.UpdateStreamer)
		g.POST("/s_delete", h.SoftDeleteStreamer)
	}
}

// 音频流处理函数
func (h *StreamerHandler) StreamAudio(c *gin.Context) {
	var req handler.StreamerAudioReq
	err := c.ShouldBindJSON(&req)
	if err != nil {
		c.JSON(http.StatusBadRequest, tool.Response{
			Message: "参数错误",
			Body:    err,
		})
		return
	}
	if len(req.ID) <= 0 {
		c.JSON(http.StatusBadRequest, tool.Response{
			Message: "参数id为空，有问题",
			Body:    nil,
		})
		return
	}

	// 1. 查询存储路径
	condition := filter.FindStreamer{
		ID: req.ID,
	}
	streamer, err := h.svc.FindStreamer(&condition)
	if err != nil {
		log.Println(err)
		c.JSON(http.StatusBadRequest, tool.Response{
			Message: "查找错误",
			Body:    err,
		})
		return
	}

	// 2. 安全校验：防止路径穿越（关键！）
	relPath := streamer.StoragePath
	if strings.Contains(relPath, "..") || strings.HasPrefix(relPath, "/") || strings.HasPrefix(relPath, "\\") {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid path"})
		return
	}

	// 3. 拼接完整 Windows 路径（filepath.Join 自动处理 \）
	fullPath := filepath.Join(music_storage_path.MusicRoot, filepath.FromSlash(relPath))

	// 4. 检查文件是否存在
	if _, err := os.Stat(fullPath); os.IsNotExist(err) {
		c.AbortWithStatusJSON(http.StatusNotFound, gin.H{"error": "audio file not found on disk"})
		return
	}

	// 5. 设置正确的 Content-Type
	contentType := "audio/mpeg"
	switch {
	case strings.HasSuffix(strings.ToLower(fullPath), ".flac"):
		contentType = "audio/flac"
	case strings.HasSuffix(strings.ToLower(fullPath), ".m4a"), strings.HasSuffix(strings.ToLower(fullPath), ".aac"):
		contentType = "audio/mp4"
	case strings.HasSuffix(strings.ToLower(fullPath), ".wav"):
		contentType = "audio/wav"
	}

	// 6. 设置响应头（支持 Range 请求 = 支持进度条拖动）
	c.Header("Content-Type", contentType)
	c.Header("Accept-Ranges", "bytes")

	// 7. 使用 Gin 的 File 方法（底层调用 http.ServeContent，自动处理 Range）
	c.File(fullPath)
}

func (h *StreamerHandler) CreateStreamer(c *gin.Context) {
	var data model.Streamer
	err := c.ShouldBindJSON(&data)
	if err != nil {
		log.Println(err)
		c.JSON(http.StatusBadRequest, tool.Response{
			Message: "参数错误",
			Body:    err,
		})
		return
	}

	err = h.svc.CreateStreamer(&data)
	if err != nil {
		log.Println(err)
		c.JSON(http.StatusBadRequest, tool.Response{
			Message: "添加错误",
			Body:    err,
		})
		return
	}

	c.JSON(http.StatusOK, tool.Response{
		Message: "成功",
		Body:    nil,
	})
}

func (h *StreamerHandler) FindStreamer(c *gin.Context) {
	//var req handler.FindStreamerReq
}

func (h *StreamerHandler) UpdateStreamer(c *gin.Context) {
	var data model.Streamer
	err := c.ShouldBindJSON(&data)
	if err != nil {
		log.Println(err)
		c.JSON(http.StatusBadRequest, tool.Response{
			Message: "参数错误",
			Body:    err,
		})
		return
	}

	err = h.svc.UpdateStreamer(&data)
	if err != nil {
		log.Println(err)
		c.JSON(http.StatusOK, tool.Response{
			Message: "更新错误",
			Body:    err,
		})
		return
	}

	c.JSON(http.StatusOK, tool.Response{
		Message: "成功",
		Body:    nil,
	})
}

func (h *StreamerHandler) SoftDeleteStreamer(c *gin.Context) {
	var req handler.DeleteStreamerReq
	err := c.ShouldBindJSON(&req)
	if err != nil {
		log.Println(err)
		c.JSON(http.StatusBadRequest, tool.Response{
			Message: "参数错误",
			Body:    err,
		})
		return
	}

	err = h.svc.DeleteStreamer(req.ID)
	if err != nil {
		log.Println(err)
		c.JSON(http.StatusOK, tool.Response{
			Message: "删除错误",
			Body:    err,
		})
		return
	}
	c.JSON(http.StatusOK, tool.Response{
		Message: "成功",
		Body:    nil,
	})
}
