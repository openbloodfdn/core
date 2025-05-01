import { Injectable } from '@nestjs/common';
import { Expo, ExpoPushMessage, ExpoPushTicket } from 'expo-server-sdk';
let expo = new Expo({
  accessToken: process.env.EXPO_ACCESS_TOKEN,
  useFcmV1: true,
});

@Injectable()
export class NotificationService {
  async batch(messages: ExpoPushMessage[]) {
    let chunks = expo.chunkPushNotifications(messages);
    let tickets: ExpoPushTicket[] = [];
    for (let chunk of chunks) {
      try {
        let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
        console.log('Tickets:', ticketChunk);
      } catch (error) {
        console.error(error);
      }
    }
    return tickets;
  }

  async isValidToken(token: string) {
    return Expo.isExpoPushToken(token);
  }
}
