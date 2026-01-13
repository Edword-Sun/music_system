package router

import (
	"crypto/sha256"
	"encoding/hex"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/gin-gonic/gin"

	"music_system/model"
	"music_system/router/handler"
	"music_system/service"
	"music_system/tool"
	"music_system/tool/filter"
	"music_system/tool/music_storage_path"
)

type StreamerHandler struct {
	svc *service.StreamerService
}

func NewStreamerHandler(svc *service.StreamerService) *StreamerHandler {
	return &StreamerHandler{svc: svc}
}

func (h *StreamerHandler) Init(e *gin.Engine) {
	g := e.Group("/streamer")
	{
		g.GET("/audio", h.StreamAudio)   // 改为 GET 协议
		g.POST("/upload", h.UploadAudio) // 新增上传接口
		g.POST("/list", h.ListStreamer)
		g.POST("/find", h.FindStreamer)
		g.POST("/update", h.UpdateStreamer)
		g.POST("/delete", h.DeleteStreamer)
	}
}

// 音频流处理函数
func (h *StreamerHandler) StreamAudio(c *gin.Context) {
	id := c.Query("id")
	if len(id) <= 0 {
		c.JSON(http.StatusBadRequest, tool.Response{
			Message: "参数id为空，有问题",
			Body:    nil,
		})
		return
	}

	// 1. 查询存储路径
	condition := filter.FindStreamer{
		ID: id,
	}
	streamer, err := h.svc.FindStreamer(&condition)
	if err != nil || streamer == nil || streamer.ID == "" {
		log.Println(err)
		c.JSON(http.StatusNotFound, tool.Response{
			Message: "未找到音频记录",
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

	// 3. 拼接完整 Windows 路径
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

	// 7. 使用 Gin 的 File 方法
	c.File(fullPath)
}

func (h *StreamerHandler) UploadAudio(c *gin.Context) {
	header, err := c.FormFile("audio")
	if err != nil {
		c.JSON(http.StatusBadRequest, tool.Response{
			Message: "文件上传失败",
			Body:    err.Error(),
		})
		return
	}

	// 打开文件以读取内容
	file, err := header.Open()
	if err != nil {
		c.JSON(http.StatusInternalServerError, tool.Response{
			Message: "无法打开上传的文件",
			Body:    err.Error(),
		})
		return
	}
	defer file.Close()

	// 计算文件哈希
	hash := sha256.New()
	if _, err := io.Copy(hash, file); err != nil {
		c.JSON(http.StatusInternalServerError, tool.Response{
			Message: "哈希计算失败",
			Body:    err.Error(),
		})
		return
	}
	hashSum := hex.EncodeToString(hash.Sum(nil))

	// 获取文件后缀
	ext := strings.ToLower(filepath.Ext(header.Filename))
	if ext == "" {
		ext = ".mp3" // 默认 mp3
	}

	// 生成相对存储路径 (例如: a3/a3f8c2b1.mp3)
	relDir := hashSum[:2]
	relPath := filepath.Join(relDir, hashSum+ext)
	fullDir := filepath.Join(music_storage_path.MusicRoot, relDir)
	fullPath := filepath.Join(music_storage_path.MusicRoot, relPath)

	// 创建目录
	if err := os.MkdirAll(fullDir, 0755); err != nil {
		c.JSON(http.StatusInternalServerError, tool.Response{
			Message: "目录创建失败",
			Body:    err.Error(),
		})
		return
	}

	// 如果文件不存在则保存
	if _, err := os.Stat(fullPath); os.IsNotExist(err) {
		if err := c.SaveUploadedFile(header, fullPath); err != nil {
			c.JSON(http.StatusInternalServerError, tool.Response{
				Message: "文件保存失败",
				Body:    err.Error(),
			})
			return
		}
	}

	// 保存记录到数据库
	streamer := &model.Streamer{
		StoragePath:  filepath.ToSlash(relPath),
		OriginalName: header.Filename,
		Format:       strings.TrimPrefix(ext, "."),
	}

	err = h.svc.CreateStreamer(streamer)
	if err != nil {
		c.JSON(http.StatusInternalServerError, tool.Response{
			Message: "数据库记录创建失败",
			Body:    err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, tool.Response{
		Message: "上传成功",
		Body:    streamer,
	})
}

func (h *StreamerHandler) ListStreamer(c *gin.Context) {
	var req handler.ListStreamerReq
	err := c.ShouldBindJSON(&req)
	if err != nil {
		log.Println(err)
		c.JSON(http.StatusBadRequest, tool.Response{
			Message: "参数错误",
			Body:    err,
		})
		return
	}

	if req.Page <= 0 {
		req.Page = 1
	}
	if req.Size <= 0 {
		req.Size = 10
	}

	data, total, err := h.svc.ListStreamer(req.Page, req.Size)
	if err != nil {
		log.Println(err)
		c.JSON(http.StatusOK, tool.Response{
			Message: "查询列表错误",
			Body:    err,
		})
		return
	}

	c.JSON(http.StatusOK, tool.Response{
		Message: "成功",
		Body: handler.ListStreamerResp{
			Total: total,
			Data:  data,
		},
	})
}

func (h *StreamerHandler) FindStreamer(c *gin.Context) {
	var req handler.FindStreamerReq
	err := c.ShouldBindJSON(&req)
	if err != nil {
		log.Println(err)
		c.JSON(http.StatusBadRequest, tool.Response{
			Message: "参数错误",
			Body:    err,
		})
		return
	}

	condition := filter.FindStreamer{
		ID:           req.ID,
		StoragePath:  req.StoragePath,
		OriginalName: req.OriginalName,
		Format:       req.Format,
	}

	data, err := h.svc.FindStreamer(&condition)
	if err != nil {
		log.Println(err)
		c.JSON(http.StatusOK, tool.Response{
			Message: "查找错误",
			Body:    err,
		})
		return
	}

	c.JSON(http.StatusOK, tool.Response{
		Message: "成功",
		Body:    data,
	})
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

func (h *StreamerHandler) DeleteStreamer(c *gin.Context) {
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
