package router

import (
	"fmt"
	"music_system/service"
	"music_system/tool/music_storage_path"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/gin-gonic/gin"
)

// 模拟数据库（实际项目中替换为你的 DB 查询）
var mockTrackDB = map[string]string{
	"123": "a3/a3f8c2b1.mp3",
	"456": "7b/7b12e9f0.flac",
}

// 从数据库获取存储路径（替换为你的真实逻辑）
func getStoragePath(trackID string) (string, error) {
	if path, exists := mockTrackDB[trackID]; exists {
		return path, nil
	}
	return "", fmt.Errorf("track not found")
}

// 音频流处理函数
func streamAudio(c *gin.Context) {
	trackID := c.Query("trackId")
	if trackID == "" {
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": "trackId is required"})
		return
	}

	// 1. 查询存储路径
	relPath, err := getStoragePath(trackID)
	if err != nil {
		c.AbortWithStatusJSON(http.StatusNotFound, gin.H{"error": "track not found"})
		return
	}

	// 2. 安全校验：防止路径穿越（关键！）
	if strings.Contains(relPath, "..") || strings.HasPrefix(relPath, "/") || strings.HasPrefix(relPath, "\\") {
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": "invalid path"})
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

//----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

type StreamerHandler struct {
	svc *service.StreamerService
}

func NewStreamerHandler(svc *service.StreamerService) *StreamerHandler {
	return &StreamerHandler{svc: svc}
}

func (h *StreamerHandler) Init(e *gin.Engine) {
	g := e.Group("/streamer")
	{
		g.POST("/add", h.CreateStreamer)
		//g.POST("/find", h.FindStreamer)
		//g.POST("/update", h.UpdateStreamer)
		//g.POST("/delete", h.DeleteStreamer)
	}
}

func (h *StreamerHandler) CreateStreamer(c *gin.Context) {

}
