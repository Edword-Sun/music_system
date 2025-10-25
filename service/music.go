package service

import (
	"fmt"

	uuid "github.com/satori/go.uuid"

	"music_system/model"
	"music_system/repository"
)

type MusicService struct {
	musicRepo *repository.MusicRepository
}

func NewMusicService(musicRepo *repository.MusicRepository) *MusicService {
	return &MusicService{
		musicRepo: musicRepo,
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

func (svc *MusicService) ListMusics(offset, limit int) ([]model.Music, int64, error) {
	musics, total, err := svc.musicRepo.List(offset, limit)
	if err != nil {
		fmt.Println("svc list musics 错误")
		return nil, 0, err
	}
	return musics, total, nil
}
