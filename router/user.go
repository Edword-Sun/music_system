package router

import (
	"fmt"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"

	"music_system/model"
	"music_system/service"
	"music_system/tool"
)

type UserHandler struct {
	userService *service.UserService
}

func NewUserHandler(userService *service.UserService) *UserHandler {
	return &UserHandler{
		userService: userService,
	}
}

func (h *UserHandler) Init(engine *gin.Engine) {
	g := engine.Group("/user")
	{
		g.GET("/", h.FindUser)
		g.GET("/list/", h.ListUser)

		g.POST("/", h.CreateUser)
		g.PUT("/:id", h.UpdateUser)
		g.DELETE("/:id", h.DeleteUser)
	}

}

func (h *UserHandler) FindUser(c *gin.Context) {
	var user model.User

	if err := c.ShouldBindJSON(&user); err != nil && err.Error() != "EOF" {
		fmt.Println("error: ", err.Error())
		c.JSON(http.StatusOK, tool.Response{
			Message: "Bad Request",
			Body:    gin.H{"error": err.Error()},
		})

		return
	}

	//if user.ID == "" {
	//	c.JSON(http.StatusOK, tool.Response{
	//		Message: "Bad Request",
	//		Body:    gin.H{"error": "User ID is required"},
	//	})
	//	return
	//}

	err, getUser := h.userService.FindUser(&user)
	if err != nil {
		fmt.Println("error: ", err.Error())
		c.JSON(http.StatusOK, tool.Response{
			Message: "Internal Server Error",
			Body:    gin.H{"error": err.Error()},
		})
		return
	}

	if getUser == nil {
		c.JSON(http.StatusOK, tool.Response{
			Message: "不存在",
			Body:    "",
		})
		return
	}

	c.JSON(http.StatusOK, tool.Response{
		Message: "Success",
		Body:    getUser,
	})
}

func (h *UserHandler) CreateUser(c *gin.Context) {
	var user model.User
	if err := c.ShouldBindJSON(&user); err != nil && err.Error() != "EOF" {
		fmt.Println("error: ", err.Error())
		c.JSON(http.StatusOK, tool.Response{
			Message: "参数错误",
			Body:    gin.H{"error": err.Error()},
		})

		return
	}
	err, id := h.userService.CreateUser(&user)
	if err != nil {
		fmt.Println("error: ", err.Error())
		c.JSON(http.StatusOK, tool.Response{
			Message: "创建错误",
			Body:    gin.H{"error": err.Error()},
		})

		return
	}

	c.JSON(http.StatusOK, tool.Response{
		Message: "创建用户成功",
		Body:    gin.H{"id": id},
	})

}

func (h *UserHandler) UpdateUser(c *gin.Context) {
	id := c.Param("id")
	var user model.User
	user.ID = id

	if err := c.ShouldBindJSON(&user); err != nil && err.Error() != "EOF" {
		fmt.Println("error: ", err.Error())
		c.JSON(http.StatusOK, tool.Response{
			Message: "参数错误",
			Body:    gin.H{"error": err.Error()},
		})

		return
	}

	if err := h.userService.UpdateUser(&user); err != nil {
		fmt.Println("error: ", err.Error())
		c.JSON(http.StatusOK, tool.Response{
			Message: "更新错误",
			Body:    gin.H{"error": err.Error()},
		})

		return
	}

	c.JSON(http.StatusOK, tool.Response{
		Message: "更新用户成功",
		Body:    "",
	})
}

func (h *UserHandler) DeleteUser(c *gin.Context) {
	id := c.Param("id")

	if err := h.userService.DeleteUser(&model.User{ID: id}); err != nil {
		fmt.Println("error: ", err.Error())
		c.JSON(http.StatusOK, tool.Response{
			Message: "删除错误",
			Body:    gin.H{"error": err.Error()},
		})

		return
	}

	c.JSON(http.StatusOK, tool.Response{
		Message: "删除用户成功",
		Body:    "",
	})
}

func (h *UserHandler) ListUser(c *gin.Context) {
	// page size

	data, total, err := h.userService.ListUsers()
	if err != nil {
		log.Println("list user 错误")
		c.JSON(http.StatusOK, tool.Response{
			Message: "list user 错误",
			Body:    gin.H{"error": err.Error()},
		})
	}

	c.JSON(http.StatusOK, tool.Response{
		Message: "list user 成功",
		Body: gin.H{
			"total": total,
			"data":  data,
		},
	})
}
