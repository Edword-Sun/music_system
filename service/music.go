package service

import (
	"fmt"
	"log"
	"os"
	"path/filepath"
	"strings"

	"github.com/dhowden/tag"
	uuid "github.com/satori/go.uuid"

	"music_system/model"
	"music_system/repository"
	"music_system/tool/music_storage_path"
)

type MusicService struct {
	musicRepo    *repository.MusicRepository
	streamerRepo *repository.StreamerRepository
}

func NewMusicService(musicRepo *repository.MusicRepository, streamerRepo *repository.StreamerRepository) *MusicService {
	return &MusicService{
		musicRepo:    musicRepo,
		streamerRepo: streamerRepo,
	}
}

func (svc *MusicService) CreateMusic(music *model.Music) (error, string) {
	music.ID = uuid.NewV4().String()
	//music.CreatedTime = time.Now()
	//music.UpdatedTime = time.Now()

	err := svc.musicRepo.Create(music)
	if err != nil {
		fmt.Println("svc create music 错误")
		return err, ""
	}

	return nil, music.ID
}

func (svc *MusicService) BatchCreateFromStreamers() (int, error) {
	streamers, err := svc.streamerRepo.GetUnlinkedStreamers()
	if err != nil {
		return 0, err
	}

	count := 0
	for _, streamer := range streamers {
		// 1. 尝试从文件元数据提取信息
		fullPath := filepath.Join(music_storage_path.MusicRoot, filepath.FromSlash(streamer.StoragePath))
		metadata, err := svc.extractMetadata(fullPath)
		if err != nil {
			log.Printf("提取元数据失败 (文件: %s): %v", fullPath, err)
		}

		singer := "未知歌手"
		name := ""
		album := "未知专辑"

		if err == nil && metadata != nil {
			if metadata.SingerName != "" {
				singer = metadata.SingerName
			}
			if metadata.Name != "" {
				name = metadata.Name
			}
			if metadata.Album != "" {
				album = metadata.Album
			}
		}

		// 2. 如果标签中没有歌名，则从原始文件名解析
		if name == "" {
			filename := streamer.OriginalName
			ext := filepath.Ext(filename)
			nameWithoutExt := strings.TrimSuffix(filename, ext)

			name = nameWithoutExt
			if strings.Contains(nameWithoutExt, " - ") {
				parts := strings.SplitN(nameWithoutExt, " - ", 2)
				// 如果标签里没歌手，文件名里有，就用文件名的
				if singer == "未知歌手" {
					singer = strings.TrimSpace(parts[0])
				}
				name = strings.TrimSpace(parts[1])
			}
		}

		music := &model.Music{
			ID:         uuid.NewV4().String(),
			Name:       name,
			SingerName: singer,
			StreamerID: streamer.ID,
			Album:      album,
			Band:       "未知乐队",
			Lyrics:     svc.findLyrics(fullPath),
		}

		if err := svc.musicRepo.Create(music); err == nil {
			count++
		}
	}

	return count, nil
}

func (svc *MusicService) findLyrics(audioPath string) string {
	lrcPath := strings.TrimSuffix(audioPath, filepath.Ext(audioPath)) + ".lrc"
	if _, err := os.Stat(lrcPath); err == nil {
		content, err := os.ReadFile(lrcPath)
		if err == nil {
			return string(content)
		}
	}
	return ""
}

func (svc *MusicService) extractMetadata(filePath string) (*model.Music, error) {
	f, err := os.Open(filePath)
	if err != nil {
		return nil, err
	}
	defer f.Close()

	m, err := tag.ReadFrom(f)
	if err != nil {
		return nil, err
	}

	return &model.Music{
		Name:       m.Title(),
		SingerName: m.Artist(),
		Album:      m.Album(),
	}, nil
}

func (svc *MusicService) FindMusic(music *model.Music) (error, *model.Music) {
	err, getMusic := svc.musicRepo.Find(music)
	if err != nil {
		fmt.Println("svc find music 错误")
		return err, nil
	}
	return nil, getMusic
}

func (svc *MusicService) UpdateMusic(music *model.Music) error {
	//user.UpdatedTime = time.Now()
	err := svc.musicRepo.Update(music)
	if err != nil {
		fmt.Println("svc update music 错误")
		return err
	}
	return nil
}

func (svc *MusicService) DeleteMusic(music *model.Music) error {
	err := svc.musicRepo.Delete(music)
	if err != nil {
		fmt.Println("svc delete music 错误")
		return err
	}
	return nil
}

func (svc *MusicService) ListMusics(offset, limit int, keyword string) ([]model.Music, int64, error) {
	musics, total, err := svc.musicRepo.List(offset, limit, keyword)
	if err != nil {
		fmt.Println("svc list musics 错误")
		return nil, 0, err
	}
	return musics, total, nil
}
