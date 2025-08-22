import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface GetRegistrationsParams {
  status?: string;
  page: number;
  limit: number;
  search?: string;
}

export interface FunnelAnalytics {
  started: number;
  docs_uploaded: number;
  payment_initiated: number;
  paid: number;
  submitted: number;
  approved: number;
  rejected: number;
  total: number;
}

@Injectable()
export class SupportService {
  constructor(private prisma: PrismaService) {}

  async getRegistrations(params: GetRegistrationsParams) {
    const { status, page, limit, search } = params;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { user: { phone: { contains: search, mode: 'insensitive' } } },
        { society: { name: { contains: search, mode: 'insensitive' } } },
        { society: { city: { contains: search, mode: 'insensitive' } } },
      ];
    }

    // Get registrations with pagination
    const [registrations, total] = await Promise.all([
      this.prisma.registration.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              phone: true,
              role: true,
            },
          },
          society: {
            select: {
              id: true,
              name: true,
              city: true,
              state: true,
            },
          },
          documents: {
            select: {
              id: true,
              type: true,
              uploadedAt: true,
            },
          },
          payments: {
            select: {
              id: true,
              status: true,
              amount: true,
              currency: true,
              createdAt: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.registration.count({ where }),
    ]);

    return {
      registrations,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async approveRegistration(
    registrationId: string,
    approveDto: any,
    actorUserId: string,
  ) {
    // Use transaction for data consistency
    return this.prisma.$transaction(async (tx) => {
      // Get registration with user and society details
      const registration = await tx.registration.findUnique({
        where: { id: registrationId },
        include: {
          user: { select: { id: true, phone: true } },
          society: { select: { id: true, name: true } },
        },
      });

      if (!registration) {
        throw new NotFoundException('Registration not found');
      }

      if (registration.status !== 'PENDING') {
        throw new BadRequestException('Only pending registrations can be approved');
      }

      // Update registration status
      const updatedRegistration = await tx.registration.update({
        where: { id: registrationId },
        data: {
          status: 'APPROVED',
          approvedAt: new Date(),
        },
      });

      // Create audit log
      await tx.auditLog.create({
        data: {
          actorUserId,
          entityType: 'REGISTRATION',
          entityId: registrationId,
          action: 'APPROVED',
          dataJson: {
            previousStatus: registration.status,
            newStatus: 'APPROVED',
            notes: approveDto.notes,
            metadata: approveDto.metadata,
            approvedAt: new Date(),
          },
        },
      });

      return {
        message: 'Registration approved successfully',
        registration: updatedRegistration,
        auditLog: {
          action: 'APPROVED',
          timestamp: new Date(),
          actor: actorUserId,
        },
      };
    });
  }

  async rejectRegistration(
    registrationId: string,
    rejectDto: any,
    actorUserId: string,
  ) {
    // Use transaction for data consistency
    return this.prisma.$transaction(async (tx) => {
      // Get registration with user and society details
      const registration = await tx.registration.findUnique({
        where: { id: registrationId },
        include: {
          user: { select: { id: true, phone: true } },
          society: { select: { id: true, name: true } },
        },
      });

      if (!registration) {
        throw new NotFoundException('Registration not found');
      }

      if (registration.status !== 'PENDING') {
        throw new BadRequestException('Only pending registrations can be rejected');
      }

      // Update registration status
      const updatedRegistration = await tx.registration.update({
        where: { id: registrationId },
        data: {
          status: 'REJECTED',
          rejectedAt: new Date(),
          rejectionReason: rejectDto.reason,
        },
      });

      // Create audit log
      await tx.auditLog.create({
        data: {
          actorUserId,
          entityType: 'REGISTRATION',
          entityId: registrationId,
          action: 'REJECTED',
          dataJson: {
            previousStatus: registration.status,
            newStatus: 'REJECTED',
            reason: rejectDto.reason,
            notes: rejectDto.notes,
            metadata: rejectDto.metadata,
            rejectedAt: new Date(),
          },
        },
      });

      return {
        message: 'Registration rejected successfully',
        registration: updatedRegistration,
        auditLog: {
          action: 'REJECTED',
          timestamp: new Date(),
          actor: actorUserId,
          reason: rejectDto.reason,
        },
      };
    });
  }

  async getFunnelAnalytics(): Promise<FunnelAnalytics> {
    // Get counts for each funnel stage
    const [
      started,
      docsUploaded,
      paymentInitiated,
      paid,
      submitted,
      approved,
      rejected,
      total,
    ] = await Promise.all([
      // Started (INITIATED)
      this.prisma.registration.count({
        where: { funnelStage: 'INITIATED' },
      }),
      // Documents uploaded
      this.prisma.registration.count({
        where: { funnelStage: 'DOCUMENTS_UPLOADED' },
      }),
      // Payment initiated
      this.prisma.registration.count({
        where: { funnelStage: 'PAYMENT_PENDING' },
      }),
      // Payment completed
      this.prisma.registration.count({
        where: { funnelStage: 'PAYMENT_COMPLETED' },
      }),
      // Submitted
      this.prisma.registration.count({
        where: { status: 'PENDING' },
      }),
      // Approved
      this.prisma.registration.count({
        where: { status: 'APPROVED' },
      }),
      // Rejected
      this.prisma.registration.count({
        where: { status: 'REJECTED' },
      }),
      // Total
      this.prisma.registration.count(),
    ]);

    return {
      started,
      docs_uploaded: docsUploaded,
      payment_initiated: paymentInitiated,
      paid,
      submitted,
      approved,
      rejected,
      total,
    };
  }
}
