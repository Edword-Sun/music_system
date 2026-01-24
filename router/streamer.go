package router

import (
	"fmt"
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
		g.POST("/batch-upload", h.BatchUploadAudio)
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

	streamer, err := h.svc.ProcessUpload(header)
	if err != nil {
		c.JSON(http.StatusInternalServerError, tool.Response{
			Message: "处理上传失败",
			Body:    err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, tool.Response{
		Message: "上传成功",
		Body:    streamer,
	})
}

func (h *StreamerHandler) BatchUploadAudio(c *gin.Context) {
	form, err := c.MultipartForm()
	if err != nil {
		c.JSON(http.StatusBadRequest, tool.Response{
			Message: "解析表单失败",
			Body:    err.Error(),
		})
		return
	}

	files := form.File["audio"]
	if len(files) == 0 {
		c.JSON(http.StatusBadRequest, tool.Response{
			Message: "未发现上传文件",
			Body:    nil,
		})
		return
	}

	var results []*model.Streamer
	var errors []string

	for _, file := range files {
		streamer, err := h.svc.ProcessUpload(file)
		if err != nil {
			errors = append(errors, fmt.Sprintf("文件 %s 处理失败: %v", file.Filename, err))
			continue
		}
		results = append(results, streamer)
	}

	status := http.StatusOK
	message := "批量上传完成"
	if len(errors) > 0 {
		if len(results) == 0 {
			status = http.StatusInternalServerError
			message = "全部文件上传失败"
		} else {
			status = http.StatusMultiStatus
			message = "部分文件上传失败"
		}
	}

	c.JSON(status, tool.Response{
		Message: message,
		Body: gin.H{
			"success": results,
			"errors":  errors,
		},
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

	data, total, err := h.svc.ListStreamer(req.Page, req.Size, req.SearchName)
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
