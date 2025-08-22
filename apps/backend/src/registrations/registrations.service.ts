import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { UpdateRegistrationDto } from './dto/update-registration.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class RegistrationsService {
  constructor(private prisma: PrismaService) {}

  async create(createRegistrationDto: CreateRegistrationDto, userId: string) {
    // Check if user already has a registration
    const existingRegistration = await this.prisma.registration.findFirst({
      where: {
        userId,
        status: {
          not: 'CANCELLED'
        }
      }
    });

    if (existingRegistration) {
      throw new ForbiddenException('User already has an active registration');
    }

    return this.prisma.registration.create({
      data: {
        ...createRegistrationDto,
        userId,
        status: 'PENDING',
        funnelStage: 'INITIATED'
      },
      include: {
        society: true,
        documents: true,
        payments: true
      }
    });
  }

  async findOne(id: string, userId: string, userRole: UserRole) {
    const registration = await this.prisma.registration.findUnique({
      where: { id },
      include: {
        society: true,
        documents: true,
        payments: true,
        user: {
          select: {
            id: true,
            phone: true,
            role: true
          }
        }
      }
    });

    if (!registration) {
      throw new NotFoundException('Registration not found');
    }

    // Only allow access if user owns the registration or is SUPPORT/COMMITTEE
    if (userRole === UserRole.OWNER && registration.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return registration;
  }

  async update(id: string, updateRegistrationDto: UpdateRegistrationDto, userId: string, userRole: UserRole) {
    const registration = await this.prisma.registration.findUnique({
      where: { id }
    });

    if (!registration) {
      throw new NotFoundException('Registration not found');
    }

    // Only allow updates if user owns the registration or is SUPPORT/COMMITTEE
    if (userRole === UserRole.OWNER && registration.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    // If updating society details, create or update society record
    let societyData = {};
    if (updateRegistrationDto.societyDetails) {
      if (registration.societyId) {
        // Update existing society
        societyData = {
          society: {
            update: {
              data: updateRegistrationDto.societyDetails
            }
          }
        };
      } else {
        // Create new society
        societyData = {
          society: {
            create: {
              ...updateRegistrationDto.societyDetails,
              createdByUserId: userId
            }
          }
        };
      }
    }

    // Update funnel stage if provided
    if (updateRegistrationDto.funnelStage) {
      updateRegistrationDto.funnelStage = updateRegistrationDto.funnelStage;
    }

    // Remove societyDetails from the update data as it's handled separately
    const { societyDetails, ...updateData } = updateRegistrationDto;

    return this.prisma.registration.update({
      where: { id },
      data: {
        ...updateData,
        ...societyData
      },
      include: {
        society: true,
        documents: true,
        payments: true
      }
    });
  }

  async findByUser(userId: string) {
    return this.prisma.registration.findMany({
      where: { userId },
      include: {
        society: true,
        documents: true,
        payments: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async markAsSubmitted(id: string) {
    return this.prisma.registration.update({
      where: { id },
      data: {
        status: 'SUBMITTED' as any,
        funnelStage: 'UNDER_REVIEW',
        submittedAt: new Date()
      }
    });
  }

  async updateFunnelStage(id: string, funnelStage: string) {
    return this.prisma.registration.update({
      where: { id },
      data: { funnelStage: funnelStage as any }
    });
  }
}
