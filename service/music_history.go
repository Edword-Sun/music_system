package service

import (
	"log"

	"music_system/model"
	"music_system/repository"
	"music_system/tool/filter"
)

type MusicHistoryService struct {
	MusicHistoryRepository *repository.MusicHistoryRepository
}

func NewMusicHistoryService(MHRepo *repository.MusicHistoryRepository) *MusicHistoryService {
	return &MusicHistoryService{
		MusicHistoryRepository: MHRepo,
	}
}

func (svc *MusicHistoryService) CreateMusicHistory(mh *model.MusicHistory) error {
	err := svc.MusicHistoryRepository.CreateMusicHistory(mh)
	if err != nil {
		log.Println("err: ", err.Error())
		return err
	}

	return nil
}

func (svc *MusicHistoryService) FindMusicHistory(condition filter.FindMusicHistory) (error, []*model.MusicHistory) {
	err, data := svc.MusicHistoryRepository.FindMusicHistory(condition)
	if err != nil {
		log.Println("err: ", err.Error())
		return err, nil
	}

	return nil, data
}
func (svc *MusicHistoryService) ListMusicHistory(condition filter.ListMusicHistory) (error, []*model.MusicHistory, int64) {
	err, data, total := svc.MusicHistoryRepository.ListMusicHistory(condition)
	if err != nil {
		log.Println("err: ", err.Error())
		return err, nil, 0
	}

	return nil, data, total
}
func (svc *MusicHistoryService) UpdateMusicHistory(mh *model.MusicHistory) error {
	err := svc.MusicHistoryRepository.UpdateMusicHistory(mh)
	if err != nil {
		log.Println("err: ", err.Error())
		return err
	}

	return nil
}
func (svc *MusicHistoryService) DeleteMusicHistory(condition filter.DeleteMusicHistory) error {
	err := svc.MusicHistoryRepository.DeleteMusicHistory(condition)
	if err != nil {
		log.Println("err: ", err.Error())
		return err
	}

	return nil
}

func (svc *MusicHistoryService) DeleteAllMusicHistory() error {
	err := svc.MusicHistoryRepository.DeleteAllMusicHistory()
	if err != nil {
		log.Println("err: ", err.Error())
		return err
	}
	return nil
}

func (svc *MusicHistoryService) GetTopMusic(limit int) (error, []*repository.MusicStat) {
	err, stats := svc.MusicHistoryRepository.GetTopMusic(limit)
	if err != nil {
		log.Println("err: ", err.Error())
		return err, nil
	}
	return nil, stats
}
