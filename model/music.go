package model

import (
	"gorm.io/gorm"
	"time"
)

type Music struct {
	ID          string `gorm:"primarykey type:text;default:(UUID())" json:"id"`
	Title       string `gorm:"type:text" json:"title"`
	Description string `gorm:"type:text" json:"description"`
	Content     string `gorm:"type:text" json:"content"`
	PlayTime    string `gorm:"type:text" json:"play_time"`
	SingerName  string `gorm:"type:text" json:"singer_name"`
	CoverURL    string `gorm:"type:text" json:"cover_url"`
	SourceURL   string `gorm:"type:text" json:"source_url"`
	DurationMs  int    `gorm:"type:integer" json:"duration_ms"`
	MimeType    string `gorm:"type:text" json:"mime_type"`
	BitrateKbps int    `gorm:"type:integer" json:"bitrate_kbps"`
	FileSize    int64  `gorm:"type:bigint" json:"file_size"`
	HashSHA256  string `gorm:"type:text" json:"hash_sha256"`
	Status      string `gorm:"type:text" json:"status"`
	IsDelete    bool   `gorm:"type:boolean" json:"is_delete"`

	CreateTime time.Time `gorm:"type:DATETIME with time zone;not null" json:"create_time"`
	UpdateTime time.Time `gorm:"type:DATETIME with time zone;not null" json:"update_time"`
}

func (m *Music) TableName() string {
	return "music"
}

func (m *Music) BeforeCreate(tx *gorm.DB) (err error) {
	m.CreateTime = time.Now()
	m.UpdateTime = time.Now()
	return nil
}

func (m *Music) BeforeUpdate(tx *gorm.DB) (err error) {
	m.UpdateTime = time.Now()
	return nil
}
