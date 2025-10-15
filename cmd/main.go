package main

import (
	"github.com/gin-gonic/gin"
	"music_system/config"
	"music_system/repository"
	"music_system/service"

	"music_system/router"
)

func main() {
	// Initialize database connection
	config.InitDB()

	r := gin.Default()

	// Initialize repository
	userRepo := repository.NewUserRepository()

	// Initialize services
	userService := service.NewUserService(userRepo)

	// Initialize handlers and register routes
	healthHandler := router.NewHealthHandler()
	userHandler := router.NewUserHandler(userService)

	healthHandler.Init(r)
	userHandler.Init(r)

	r.Run(":8080") // listen and serve on 0.0.0.0:8080
}
