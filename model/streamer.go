package model

import (
	"time"

	"gorm.io/gorm"
)

type Streamer struct {
	ID           string `gorm:"type:text;default:((UUID))" json:"id"`
	StoragePath  string `gorm:"type:text" json:"storage_path"` // 示例: "a3/a3f8c2b1.mp3"
	OriginalName string `gorm:"type:text" json:"original_name"`
	Format       string `gorm:"type:text" json:"format"` // "mp3", "flac", etc.

	CreateTime time.Time `gorm:"type:datetime" json:"create_time"`
	UpdateTime time.Time `gorm:"type:datetime" json:"update_time"`
	IsDeleted  bool      `gorm:"type:boolean" json:"is_deleted"`
}

func (m *Streamer) TableName() string {
	return "streamer"
}

func (m *Streamer) BeforeCreate(tx *gorm.DB) (err error) {
	m.CreateTime = time.Now()
	m.UpdateTime = time.Now()

	m.IsDeleted = false
	return nil
}

func (m *Streamer) BeforeUpdate(tx *gorm.DB) (err error) {
	m.UpdateTime = time.Now()
	return nil
}
