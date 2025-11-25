package router

import (
	"github.com/gin-gonic/gin"

	"music_system/service"
	"music_system/tool"
)

type MusicHistoryHandler struct {
	MusicHistoryService *service.MusicHistoryService
}

func NewMusicHistoryHandler(MHSvc *service.MusicHistoryService) *MusicHistoryHandler {
	return &MusicHistoryHandler{
		MusicHistoryService: MHSvc,
	}
}

func (h *MusicHistoryHandler) Init(engin *gin.Engine) {
	g := engin.Group("/mh")
	{

		g.POST("/get", h.FindMusicHistory)
		g.POST("/list", h.ListMusicHistory)

		g.POST("/add", h.AddMusicHistory)

		g.PUT("/update", h.UpdateMusicHistory)

		g.POST("/delete", h.DeleteMusicHistory)

	}
}

func (h *MusicHistoryHandler) FindMusicHistory(c *gin.Context) {
	c.JSON(200, tool.Response{
		Message: "/get",
		Body:    nil,
	})
	return
}
func (h *MusicHistoryHandler) ListMusicHistory(c *gin.Context) {
	c.JSON(200, tool.Response{
		Message: "/list",
		Body:    nil,
	})
	return
}
func (h *MusicHistoryHandler) AddMusicHistory(c *gin.Context) {
	c.JSON(200, tool.Response{
		Message: "/add",
		Body:    nil,
	})
	return
}
func (h *MusicHistoryHandler) UpdateMusicHistory(c *gin.Context) {
	c.JSON(200, tool.Response{
		Message: "/update",
		Body:    nil,
	})
	return
}
func (h *MusicHistoryHandler) DeleteMusicHistory(c *gin.Context) {
	c.JSON(200, tool.Response{
		Message: "/delete",
		Body:    nil,
	})
	return
}
