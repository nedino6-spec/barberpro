import { PrismaService } from '../prisma/prisma.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
export declare class AppointmentsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(date?: string): Promise<({
        customer: {
            name: string;
            id: string;
            phone: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string | null;
            photo: string | null;
            preferences: string | null;
            totalVisits: number;
            lastVisit: Date | null;
            notes: string | null;
            isBlocked: boolean;
        };
        service: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string | null;
            description: string | null;
            durationMinutes: number;
            price: number;
            active: boolean;
            pointsEarned: number;
        };
        barber: {
            email: string;
            password: string | null;
            name: string;
            role: string;
            id: string;
            phone: string | null;
            avatar: string | null;
            specialty: string | null;
            startTime: string | null;
            endTime: string | null;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string | null;
        };
    } & {
        id: string;
        startTime: string;
        endTime: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string | null;
        customerId: string;
        barberId: string;
        serviceId: string;
        date: Date;
        status: string;
        googleEventId: string | null;
    })[]>;
    create(createAppointmentDto: CreateAppointmentDto): Promise<{
        customer: {
            name: string;
            id: string;
            phone: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string | null;
            photo: string | null;
            preferences: string | null;
            totalVisits: number;
            lastVisit: Date | null;
            notes: string | null;
            isBlocked: boolean;
        };
        service: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string | null;
            description: string | null;
            durationMinutes: number;
            price: number;
            active: boolean;
            pointsEarned: number;
        };
        barber: {
            email: string;
            password: string | null;
            name: string;
            role: string;
            id: string;
            phone: string | null;
            avatar: string | null;
            specialty: string | null;
            startTime: string | null;
            endTime: string | null;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string | null;
        };
    } & {
        id: string;
        startTime: string;
        endTime: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string | null;
        customerId: string;
        barberId: string;
        serviceId: string;
        date: Date;
        status: string;
        googleEventId: string | null;
    }>;
}
