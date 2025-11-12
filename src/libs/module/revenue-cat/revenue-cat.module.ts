import { Module } from '@nestjs/common';
import { RevenueCatService } from './revenue-cat.service';
import { HttpModule } from '@nestjs/axios';

@Module({
    imports: [HttpModule.register({})],
    providers: [RevenueCatService],
    exports: [RevenueCatService],
})
export class RevenueCatModule {}
