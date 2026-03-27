import { PresidioService } from './presidio.service';
import { Injectable ,UseGuards} from '@nestjs/common';
import { JwtAuthGuard } from '@/common/guards/auth.guard';
@Injectable()
@UseGuards(JwtAuthGuard)
export class SyntheticDataService{
    constructor(){

    }
}