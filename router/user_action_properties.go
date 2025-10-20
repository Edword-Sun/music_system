package router

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	uuid "github.com/satori/go.uuid"

	"music_system/model"
	"music_system/service"
	"music_system/tool"
)

type UserActionPropertiesHandler struct {
	UserActionPropertiesService *service.UserActionPropertiesService
}

func NewUserActionPropertiesHandler(UAPSvc *service.UserActionPropertiesService) *UserActionPropertiesHandler {
	return &UserActionPropertiesHandler{
		UserActionPropertiesService: UAPSvc,
	}
}

func (h *UserActionPropertiesHandler) Init(g *gin.Engine) {
	g.Group("/uap")
	{
		g.GET("", h.CreateUserActionProperties)
		g.POST("")
		g.PUT("")
		g.DELETE("")
	}
}

func (h *UserActionPropertiesHandler) CreateUserActionProperties(c *gin.Context) {
	var UAP model.UserActionProperties
	err := c.ShouldBindJSON(&UAP)
	if err != nil {
		log.Println("参数错误")
		c.JSON(http.StatusOK, tool.Response{
			Message: "参数错误",
			Body:    nil,
		})

		return
	}

	UAP.ID = uuid.NewV4().String()
	err = h.UserActionPropertiesService.CreateUserActionProperties(&UAP)
	if err != nil {
		log.Println("err: ", err)
		c.JSON(http.StatusOK, tool.Response{
			Message: "创建user_action_properties错误",
			Body:    nil,
		})

		return
	}

	log.Println("创建user_action_properties成功")
	c.JSON(http.StatusOK, tool.Response{
		Message: "创建user_action_properties成功",
		Body: gin.H{
			"id": UAP.ID,
		},
	})
}
