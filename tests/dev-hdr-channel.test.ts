import { describe, expect, it, rstest } from '@rstest/core';
import {
  createDevHdrChannel,
  DEV_HDR_UPDATE_EVENT,
} from '../src/dev-hdr-channel';

const createChannel = () => {
  const send = rstest.fn();
  const unsubscribe = rstest.fn();
  let connect!: (client: { send: typeof send }) => void;
  let enabled = true;
  const channel = createDevHdrChannel({
    hot: {
      send,
      onConnect: callback => {
        connect = callback;
        return unsubscribe;
      },
    },
    isEnabled: () => enabled,
  });
  return {
    channel,
    send,
    unsubscribe,
    connect: (clientSend = rstest.fn()) => {
      connect({ send: clientSend });
      return clientSend;
    },
    disable: () => {
      enabled = false;
    },
  };
};

describe('HDR channel', () => {
  it('replays only the latest committed revision to the connecting client', () => {
    const { channel, send, connect } = createChannel();
    expect(connect()).not.toHaveBeenCalled();
    channel.publish();
    channel.publish();
    const clientSend = connect();
    expect(send).toHaveBeenCalledTimes(2);
    expect(clientSend).toHaveBeenCalledExactlyOnceWith('custom', {
      event: DEV_HDR_UPDATE_EVENT,
      data: { sessionId: expect.any(String), revision: 2 },
    });
    expect(clientSend.mock.calls[0]).toEqual(send.mock.calls[1]);
  });

  it('does not broadcast or replay when HMR is disabled', () => {
    const { channel, send, connect, disable } = createChannel();
    channel.publish();
    disable();
    channel.publish();
    expect(send).toHaveBeenCalledTimes(1);
    expect(connect()).not.toHaveBeenCalled();
  });

  it('unsubscribes once and ignores callbacks or commits after close', () => {
    const { channel, send, connect, unsubscribe } = createChannel();
    channel.publish();
    channel.close();
    channel.close();
    channel.publish();
    expect(unsubscribe).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledTimes(1);
    expect(connect()).not.toHaveBeenCalled();
  });

  it('gives a replacement server its own session and revision history', () => {
    const first = createChannel();
    first.channel.publish();
    first.channel.close();
    const second = createChannel();
    expect(second.connect()).not.toHaveBeenCalled();
    second.channel.publish();
    expect(second.send.mock.calls[0][1].data.revision).toBe(1);
    expect(second.send.mock.calls[0][1].data.sessionId).not.toBe(
      first.send.mock.calls[0][1].data.sessionId
    );
  });
});
