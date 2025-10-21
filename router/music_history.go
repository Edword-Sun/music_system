package router

import (
	"github.com/gin-gonic/gin"

	"music_system/service"
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
		g.GET("")
		g.POST("")
		g.PUT("")
		g.DELETE("")
	}
}
