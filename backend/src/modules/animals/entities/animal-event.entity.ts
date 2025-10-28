import { AnimalEntity } from "./animal.entity";

export class AnimalEventEntity {
    id: number;
    animalId: number;
    type: string;
    date?: Date;
    note?: string;
    cost?: number;
    animal: AnimalEntity;
}