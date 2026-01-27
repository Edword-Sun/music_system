package repository

import (
	"errors"
	"gorm.io/gorm"
	"log"
	"music_system/model"
	"music_system/tool/filter"
)

type StreamerRepository struct {
	db *gorm.DB
}

func NewStreamerRepository(db *gorm.DB) *StreamerRepository {
	return &StreamerRepository{db: db}
}

func (repo *StreamerRepository) Create(data *model.Streamer) error {
	query := repo.db.Model(&model.Streamer{})
	err := query.Create(data).Error
	if err != nil {
		log.Println(err)
		return errors.New("内部错误")
	}

	log.Println("创建成功")
	return nil
}

func (repo *StreamerRepository) Update(data *model.Streamer) error {
	query := repo.db.Model(&model.Streamer{})
	err := query.Updates(data).Error
	if err != nil {
		log.Println(err)
		return errors.New("内部错误")
	}

	log.Println("更新成功")
	return nil
}

func (repo *StreamerRepository) Delete(id string) error {
	query := repo.db.Model(&model.Streamer{})
	err := query.Delete(&model.Streamer{ID: id}).Error
	if err != nil {
		log.Println(err)
		return errors.New("内部错误")
	}

	log.Println("删除成功")
	return nil
}

func (repo *StreamerRepository) Find(filter *filter.FindStreamer) (*model.Streamer, error) {
	query := repo.db.Model(&model.Streamer{})
	if len(filter.ID) > 0 {
		query = query.Where("id = ?", filter.ID)
	}
	if len(filter.StoragePath) > 0 {
		query = query.Where("storage_path = ?", filter.StoragePath)
	}
	if len(filter.OriginalName) > 0 {
		query = query.Where("original_name = ?", filter.OriginalName)
	}
	if len(filter.Format) > 0 {
		query = query.Where("format = ?", filter.Format)
	}
	if !filter.StartTime.IsZero() && !filter.EndTime.IsZero() {
		query = query.Where("create_time BETWEEN ? AND ?", filter.StartTime, filter.EndTime)
	}

	res := model.Streamer{}
	err := query.Find(&res).Error
	if err != nil {
		log.Println(err)
		return nil, errors.New("内部错误")
	}
	return &res, nil
}

func (repo *StreamerRepository) List(offset, limit int, searchName string) ([]model.Streamer, int64, error) {
	var streamers []model.Streamer
	var total int64

	query := repo.db.Model(&model.Streamer{})

	if len(searchName) > 0 {
		query = query.Where("original_name LIKE ?", "%"+searchName+"%")
	}

	query = query.Order("create_time DESC")

	if err := query.Count(&total).Error; err != nil {
		log.Println("err", err)
		return nil, 0, err
	}

	err := query.Offset(offset).Limit(limit).Find(&streamers).Error
	if err != nil {
		log.Println("err", err)
		return nil, 0, errors.New("内部错误")
	}

	return streamers, total, nil
}

func (repo *StreamerRepository) GetUnlinkedStreamers() ([]model.Streamer, error) {
	var streamers []model.Streamer
	// 查找在 streamer 表中但不在 music 表中的记录
	err := repo.db.Where("id NOT IN (SELECT streamer_id FROM music)").Find(&streamers).Error
	if err != nil {
		log.Println("GetUnlinkedStreamers error:", err)
		return nil, errors.New("内部错误")
	}
	return streamers, nil
}

//func (repo *StreamerRepository) RealDelete(id string) error {
//	exists := model.Streamer{}
//
//	query := repo.db.Model(&model.Streamer{})
//	query = query.Where("id = ?", id)
//	err := query.First(&exists).Error
//	if err != nil {
//		log.Println(err)
//		return errors.New("查找存在的数据过程中，出现错误")
//	}
//	if len(exists.ID) <= 0 {
//		log.Println("数据不存在")
//		return errors.New("数据不存在")
//	}
//
//	if exists.IsDeleted == true {
//		queryDelete := repo.db.Model(&model.Streamer{})
//		err = queryDelete.Delete(&model.Streamer{ID: id}).Error
//		if err != nil {
//			log.Println(err)
//			return errors.New("内部错误")
//		}
//		log.Println("删除成功")
//		return nil
//	} else {
//		log.Println("数据没有软删除过")
//		return errors.New("数据没有软删除过")
//	}
//}
