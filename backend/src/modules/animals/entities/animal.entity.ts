import { AnimalEventEntity } from "./animal-event.entity";

export class AnimalEntity {
    id: number;
    tag?: string;
    species: string;
    birthDate?: Date
    buyPrice?: number;
    status: string;
    totalExpenses?: number;
    events: AnimalEventEntity[];
}