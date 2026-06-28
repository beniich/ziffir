import type { IChannelConnector } from './channel.interface.js';
import { BookingComConnector } from './booking-com.connector.js';
import { ExpediaConnector } from './expedia.connector.js';
import { AirbnbConnector } from './airbnb.connector.js';
import { MockOtaConnector } from './mock-ota.connector.js';

class ChannelRegistry {
  private connectors = new Map<string, IChannelConnector>();
  private mockMode = process.env.CHANNEL_MOCK_MODE === 'true';

  register(connector: IChannelConnector) {
    this.connectors.set(connector.type, connector);
  }

  get(type: string): IChannelConnector | null {
    return this.connectors.get(type) ?? null;
  }

  getAll(): IChannelConnector[] {
    return Array.from(this.connectors.values());
  }

  isMock() {
    return this.mockMode;
  }
}

export const channelRegistry = new ChannelRegistry();

// En dev : on enregistre le mock pour tous les types
if (process.env.CHANNEL_MOCK_MODE === 'true' || !process.env.BOOKING_COM_CLIENT_ID) {
  channelRegistry.register(new MockOtaConnector('BOOKING_COM'));
  channelRegistry.register(new MockOtaConnector('EXPEDIA'));
  channelRegistry.register(new MockOtaConnector('AIRBNB'));
  channelRegistry.register(new MockOtaConnector('AGODA'));
} else {
  channelRegistry.register(new BookingComConnector());
  channelRegistry.register(new ExpediaConnector());
  channelRegistry.register(new AirbnbConnector());
}
