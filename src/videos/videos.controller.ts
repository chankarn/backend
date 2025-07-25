// videos.controller.ts
import { Controller, Get, Query } from '@nestjs/common';
import { VideosService } from './videos.service';

@Controller('videos')
export class VideosController {
  constructor(private readonly videosService: VideosService) {}

  @Get()
  async getVideos(@Query('page') page: string) {
    const pageNum = parseInt(page || '1', 10); // default page = 1
    return this.videosService.discoverMovies(pageNum);
  }
}
