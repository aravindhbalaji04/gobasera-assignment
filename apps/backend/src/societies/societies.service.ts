import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSocietyDto } from './dto/create-society.dto';
import { UpdateSocietyDto } from './dto/update-society.dto';

@Injectable()
export class SocietiesService {
  constructor(private prisma: PrismaService) {}

  async create(createSocietyDto: CreateSocietyDto, createdByUserId: string) {
    return this.prisma.society.create({
      data: {
        ...createSocietyDto,
        createdByUserId,
      },
      include: {
        createdByUser: {
          select: {
            id: true,
            phone: true,
            role: true,
          },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.society.findMany({
      where: { isActive: true },
    });
  }

  async findOne(id: string) {
    const society = await this.prisma.society.findUnique({
      where: { id },
    });

    if (!society) {
      throw new NotFoundException(`Society with ID ${id} not found`);
    }

    return society;
  }

  async update(id: string, updateSocietyDto: UpdateSocietyDto) {
    return this.prisma.society.update({
      where: { id },
      data: updateSocietyDto,
    });
  }

  async remove(id: string) {
    return this.prisma.society.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
