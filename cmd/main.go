package main

import (
	"os"

	"github.com/gin-gonic/gin"

	"music_system/config"
	"music_system/model"
	"music_system/repository"
	"music_system/router"
	"music_system/router/middleware"
	"music_system/service"
	"music_system/tool/music_storage_path"
)

func main() {
	// 确保目录存在（可选）
	if err := os.MkdirAll(music_storage_path.MusicRoot, 0755); err != nil {
		panic("Failed to create music directory: " + err.Error())
	}

	// Initialize database connection
	config.InitDB()

	// 自动迁移数据库模型
	config.DB.AutoMigrate(
		&model.Music{},
		&model.Streamer{},
		&model.MusicHistory{},
		&model.Group{},
		&model.User{},
	)

	r := gin.Default()

	// Initialize repository
	musicRepo := repository.NewMusicRepository(config.DB)
	streamerRepo := repository.NewStreamerRepository(config.DB)
	musicHistoryRepository := repository.NewMusicHistoryRepository(config.DB)
	groupRepository := repository.NewGroupRepository(config.DB)
	userRepo := repository.NewUserRepository(config.DB)

	// Initialize services
	musicService := service.NewMusicService(musicRepo, streamerRepo)
	streamerService := service.NewStreamerService(streamerRepo)
	musicHistoryService := service.NewMusicHistoryService(musicHistoryRepository)
	groupService := service.NewGroupService(groupRepository)
	userService := service.NewUserService(userRepo)
	authService := service.NewAuthService(userService, "your-secret-key") // TODO: use config

	r.Use(middleware.AuthMiddleware(authService))

	// Initialize handlers and register routes
	healthHandler := router.NewHealthHandler()

	musicHandler := router.NewMusicHandler(musicService, streamerService)
	streamerHandler := router.NewStreamerHandler(streamerService)
	musicHistoryHandler := router.NewMusicHistoryHandler(musicHistoryService)
	groupHandler := router.NewGroupHandler(groupService)
	authHandler := router.NewAuthHandler(authService)

	healthHandler.Init(r)
	musicHandler.Init(r)
	streamerHandler.Init(r)
	musicHistoryHandler.Init(r)
	groupHandler.Init(r)
	authHandler.Init(r)

	r.Run(":8080") // listen and serve on 0.0.0.0:8080
}
