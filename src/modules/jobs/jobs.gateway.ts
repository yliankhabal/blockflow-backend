import { Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Job } from '@prisma/client';
import { Server, Socket } from 'socket.io';

import { JOB_EVENTS } from './jobs.events';

@WebSocketGateway({ cors: { origin: '*' } })
export class JobsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(JobsGateway.name);

  afterInit() {
    this.logger.log('WebSocket Gateway initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('subscribe')
  handleSubscribe(@MessageBody() data: { jobId: string }, @ConnectedSocket() client: Socket): void {
    client.join(`job:${data.jobId}`);
    this.logger.log(`Client ${client.id} subscribed to job:${data.jobId}`);
  }

  @SubscribeMessage('unsubscribe')
  handleUnsubscribe(@MessageBody() data: { jobId: string }, @ConnectedSocket() client: Socket): void {
    client.leave(`job:${data.jobId}`);
  }

  @OnEvent(JOB_EVENTS.UPDATED)
  handleJobUpdated(job: Job): void {
    this.server.to(`job:${job.id}`).emit('job:update', job);
  }
}
