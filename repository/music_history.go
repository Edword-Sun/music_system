package repository

import (
	"errors"
	"log"
	"time"

	"gorm.io/gorm"

	"music_system/model"
	"music_system/tool/filter"
)

const (
	MAXLIMIT = 999999999
	MAXOFFSET
)

type MusicHistoryRepository struct {
	db *gorm.DB
}

func NewMusicHistoryRepository(db *gorm.DB) *MusicHistoryRepository {
	return &MusicHistoryRepository{
		db: db,
	}
}

func (repo *MusicHistoryRepository) CreateMusicHistory(musicHistory *model.MusicHistory) error {
	query := repo.db.Model(musicHistory)
	err := query.Create(musicHistory).Error
	if err != nil {
		log.Printf("error: %v", err)
		return errors.New("内部错误")
	}

	return nil
}

func (repo *MusicHistoryRepository) FindMusicHistory(findMusicHistory filter.FindMusicHistory) (error, []*model.MusicHistory) {
	var data []*model.MusicHistory
	query := repo.db.Model(&model.MusicHistory{}).Order("create_time DESC")

	if len(findMusicHistory.ID) > 0 {
		query = query.Where("id = ?", findMusicHistory.ID)
	}
	if len(findMusicHistory.MusicID) > 0 {
		query = query.Where("music_id = ?", findMusicHistory.MusicID)
	}

	// todo 时间的检验方法还要再看
	if findMusicHistory.EndTime > 0 && findMusicHistory.StartTime > 0 {
		// 假设 condition.StartTime 是毫秒时间戳（如 1732521600000）
		startTime := time.UnixMilli(findMusicHistory.StartTime)
		endTime := time.UnixMilli(findMusicHistory.EndTime)

		// （可选）显式设置时区，确保与数据库一致
		startTime = startTime.In(time.UTC)
		endTime = endTime.In(time.UTC)

		query = query.Where("create_time BETWEEN ? AND ?", startTime, endTime)
	}

	err := query.Find(&data).Error
	if err != nil {
		log.Printf("err: %v", err)
		return errors.New("内部错误"), nil
	}
	if len(data) == 0 {
		return gorm.ErrRecordNotFound, nil // 或自定义 "未找到"
	}

	return nil, data

}

func (repo *MusicHistoryRepository) ListMusicHistory(condition filter.ListMusicHistory) (error, []*model.MusicHistory, int64) {
	var data []*model.MusicHistory
	var total int64
	query := repo.db.Model(&model.MusicHistory{}).Order("create_time DESC")

	// Apply filters
	if len(condition.IDs) > 0 {
		query = query.Where("id IN (?)", condition.IDs)
	}
	if len(condition.MusicIDs) > 0 {
		query = query.Where("music_id IN (?)", condition.MusicIDs)
	}

	startTime := time.UnixMilli(condition.StartTime)
	endTime := time.UnixMilli(condition.EndTime)
	query = query.Where("create_time BETWEEN ? AND ?", startTime, endTime)

	// Count total before pagination
	err := query.Count(&total).Error
	if err != nil {
		log.Println("err: %v", err)
		return errors.New("内部错误"), nil, 0
	}

	// Apply pagination
	if condition.Limit <= 0 {
		condition.Limit = 10
	}
	if condition.Limit > MAXLIMIT {
		condition.Limit = MAXLIMIT
	}
	if condition.Offset <= 0 {
		condition.Offset = 0
	}
	if condition.Offset > MAXOFFSET {
		condition.Offset = MAXOFFSET
	}

	err = query.Limit(condition.Limit).Offset(condition.Offset).Find(&data).Error
	if err != nil {
		log.Printf("err: %v", err)
		return errors.New("内部错误"), nil, 0
	}

	return nil, data, total
}

func (repo *MusicHistoryRepository) UpdateMusicHistory(musicHistory *model.MusicHistory) error {
	if musicHistory == nil {
		log.Println("error: 空指针 music_history")
		return errors.New("空指针 music_history")
	}
	if len(musicHistory.ID) == 0 {
		log.Println("更新失败：必须提供 ID")
		return errors.New("更新失败：必须提供 ID")
	}

	query := repo.db.Model(&model.MusicHistory{})
	query = query.Where("id = ?", musicHistory.ID)

	err := query.Updates(musicHistory).Error
	if err != nil {
		log.Println("error: 更新music_history错误")
		return errors.New("内部错误")
	}

	return nil
}

func (repo *MusicHistoryRepository) DeleteMusicHistory(condition filter.DeleteMusicHistory) error {
	query := repo.db.Model(&model.MusicHistory{})
	if len(condition.ID) > 0 {
		query = query.Where("id = ?", condition.ID)
	}
	if len(condition.IDs) > 0 {
		query = query.Where("id IN (?)", condition.IDs)
	}
	if len(condition.MusicID) > 0 {
		query = query.Where("music_id = ?", condition.MusicID)
	}

	err := query.Delete(&model.MusicHistory{}).Error
	if err != nil {
		log.Println("err: ", err)
		return errors.New("删除失败")
	}
	return nil
}

func (repo *MusicHistoryRepository) DeleteAllMusicHistory() error {
	err := repo.db.Session(&gorm.Session{AllowGlobalUpdate: true}).Delete(&model.MusicHistory{}).Error
	if err != nil {
		log.Println("err: ", err)
		return errors.New("清空失败")
	}
	return nil
}

type MusicStat struct {
	MusicID string `json:"music_id"`
	Count   int64  `json:"count"`
}

func (repo *MusicHistoryRepository) GetTopMusic(limit int) (error, []*MusicStat) {
	var stats []*MusicStat
	err := repo.db.Model(&model.MusicHistory{}).
		Select("music_id, count(*) as count").
		Group("music_id").
		Order("count DESC").
		Limit(limit).
		Scan(&stats).Error
	if err != nil {
		log.Println("err: ", err)
		return errors.New("获取统计失败"), nil
	}
	return nil, stats
}
