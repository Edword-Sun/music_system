package handler

type StreamerAudioReq struct {
	ID string `json:"id"`
}

type FindStreamerReq struct {
	ID           string `json:"id"`
	StoragePath  string `json:"storage_path"`
	OriginalName string `json:"original_name"`
	Format       string `json:"format"`
}

type DeleteStreamerReq struct {
	ID string `json:"id"`
}

type ListStreamerReq struct {
	Page       int    `json:"page"`
	Size       int    `json:"size"`
	SearchName string `json:"search_name"`
}

type ListStreamerResp struct {
	Total int64       `json:"total"`
	Data  interface{} `json:"data"`
}
