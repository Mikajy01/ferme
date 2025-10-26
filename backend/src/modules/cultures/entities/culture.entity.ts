import { CultureEventEntity } from "./culture-event.entity";
import { HarvestEntity } from "./harvest.entity";

export class CultureEntity {
    id: number;
    name: string;
    startDate: Date;
    endDate?: Date
    status: string;
    area: number;
    note: string;
    events: CultureEventEntity[];
    harvests: HarvestEntity[]
}