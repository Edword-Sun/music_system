package router

import (
	"log"
	"music_system/tool/filter"
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
		g.POST("", h.CreateUserActionProperties)
		g.PUT("", h.UpdateUserActionProperties)
		g.DELETE("", h.DeleteUserActionProperties)
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

func (h *UserActionPropertiesHandler) FindUserActionProperties(c *gin.Context) {
	var condition filter.FindUserActionProperties
	err := c.ShouldBindJSON(&condition)
	if err != nil {
		log.Println("参数错误")
		c.JSON(http.StatusOK, tool.Response{
			Message: "参数错误",
			Body:    nil,
		})

		return
	}

	var data []*model.UserActionProperties
	err, data = h.UserActionPropertiesService.FindUserActionProperties(condition)
	if err != nil {
		log.Println("err: ", err)
		c.JSON(http.StatusOK, tool.Response{
			Message: "查找user_action_properties错误",
			Body:    nil,
		})

		return
	}

	log.Println("查找user_action_properties成功")
	c.JSON(http.StatusOK, tool.Response{
		Message: "查找user_action_properties成功",
		Body:    data,
	})
}

func (h *UserActionPropertiesHandler) UpdateUserActionProperties(c *gin.Context) {
	var data model.UserActionProperties
	err := c.ShouldBindJSON(&data)
	if err != nil {
		log.Println("参数错误")
		c.JSON(http.StatusOK, tool.Response{
			Message: "参数错误",
			Body:    nil,
		})

		return
	}

	err = h.UserActionPropertiesService.UpdateUserActionProperties(&data)
	if err != nil {
		log.Println("err: ", err)
		c.JSON(http.StatusOK, tool.Response{
			Message: "更新user_action_properties错误",
			Body:    nil,
		})

		return
	}

	log.Println("更新user_action_properties成功")
	c.JSON(http.StatusOK, tool.Response{
		Message: "更新user_action_properties成功",
		Body:    nil,
	})
}

func (h *UserActionPropertiesHandler) DeleteUserActionProperties(c *gin.Context) {
	var condition filter.DeleteUserActionProperties
	err := c.ShouldBindJSON(&condition)
	if err != nil {
		log.Println("参数错误")
		c.JSON(http.StatusOK, tool.Response{
			Message: "参数错误",
			Body:    nil,
		})

		return
	}

	err = h.UserActionPropertiesService.DeleteUserActionProperties(condition)
	if err != nil {
		log.Println("err: ", err)
		c.JSON(http.StatusOK, tool.Response{
			Message: "删除user_action_properties错误",
			Body:    nil,
		})

		return
	}

	c.JSON(http.StatusOK, tool.Response{
		Message: "删除user_action_properties成功",
		Body:    nil,
	})
}
