package router

import (
	"github.com/gin-gonic/gin"

	"music_system/service"
)

type UserActionPropertiesHandler struct {
	uapSvc *service.UserActionPropertiesService
}

func NewUserActionPropertiesHandler(uapSvc *service.UserActionPropertiesService) *UserActionPropertiesHandler {
	return &UserActionPropertiesHandler{
		uapSvc: uapSvc,
	}
}

func (h *UserActionPropertiesHandler) Init(g *gin.Engine) {
	g.Group("/uap")
	{

	}
}
