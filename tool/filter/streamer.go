package filter

import "time"

type FindStreamer struct {
	ID           string `json:"id"`
	StoragePath  string `json:"storage_path"`
	OriginalName string `json:"original_name"`
	Format       string `json:"format"`

	StartTime time.Time `json:"start_time"`
	EndTime   time.Time `json:"end_time"`

	ActiveIsDelete bool `json:"active_is_delete"`
	IsDeleted      bool `json:"is_deleted"`
}
