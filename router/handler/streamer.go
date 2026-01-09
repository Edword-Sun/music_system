package handler

type StreamerAudioReq struct {
	ID string `json:"id"`
}

type FindStreamerReq struct {
}

type DeleteStreamerReq struct {
	ID string `json:"id"`
}
