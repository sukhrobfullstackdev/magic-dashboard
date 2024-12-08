import type {
  EventDetailData,
  EventLogLoginItem,
  PendingEvent,
  TimelineEvent,
} from '@custom-types/data-models/events-logs';
import {
  DeviceRegEventStatus,
  EventLogProvider,
  LoginEventStatus,
  TimelineStatus,
} from '@custom-types/data-models/events-logs';
import { eventsToTimeline, getEventDetails, getPendingEvent, isPendingEvent } from '@libs/event-logs';
import {
  eventDetailsData1,
  eventDetailsData2,
  eventDetailsData3,
  eventDetailsData4,
  eventDetailsData5,
  eventGroup1,
  eventGroup2,
  eventGroup3,
  eventGroup4,
  eventGroup5,
  eventGroupBounced,
  eventGroupDupedTimestamps,
  eventGroupDupedTimestamps2,
  ndrEventGroup1,
  ndrTimeline1,
  timeline1,
  timeline2,
  timeline3,
  timeline4,
  timeline5,
  timelineBounced,
  timelineDupedTimestamp,
  timelineDupedTimestamp2,
} from '@mocks/event-logs';

describe('lib/event-logs', () => {
  describe('isPendingEvent', () => {
    const tests: {
      assert: LoginEventStatus;
      expected: boolean;
    }[] = [
      {
        assert: LoginEventStatus.LOGIN_INITIATED,
        expected: true,
      },
      {
        assert: LoginEventStatus.EMAIL_DELIVERED,
        expected: true,
      },
      {
        assert: LoginEventStatus.ERROR,
        expected: false,
      },
      {
        assert: LoginEventStatus.EMAIL_BOUNCED,
        expected: false,
      },
      {
        assert: LoginEventStatus.EMAIL_SENT,
        expected: true,
      },
      {
        assert: LoginEventStatus.LOGIN_SUCCESS,
        expected: false,
      },
    ];

    tests.forEach(({ assert, expected }) => {
      it(`Given event status of ${assert}, should return ${expected}`, () => {
        expect(isPendingEvent(assert)).toEqual(expected);
      });
    });
  });

  describe('getPendingEvent', () => {
    const tests: {
      assert?: EventLogLoginItem;
      expected: PendingEvent;
    }[] = [
      {
        assert: eventGroup1[0],
        expected: {
          eventId: '0',
          eventStatus: LoginEventStatus.EMAIL_SENT,
        },
      },
      {
        assert: eventGroup5[3],
        expected: {
          eventId: '0',
          eventStatus: LoginEventStatus.EMAIL_DELIVERED,
        },
      },
      {
        assert: eventGroup5[2],
        expected: {
          eventId: '0',
          eventStatus: LoginEventStatus.EMAIL_OPENED,
        },
      },
      {
        assert: eventGroup5[1],
        expected: {
          eventId: '0',
          eventStatus: LoginEventStatus.LOGIN_SUCCESS,
        },
      },
      {
        assert: ndrEventGroup1[4],
        expected: {
          eventId: '0',
          eventStatus: DeviceRegEventStatus.DEVICE_REG_EMAIL_SENT,
        },
      },
      {
        assert: ndrEventGroup1[3],
        expected: {
          eventId: '0',
          eventStatus: DeviceRegEventStatus.DEVICE_REG_EMAIL_DELIVERED,
        },
      },
      {
        assert: ndrEventGroup1[2],
        expected: {
          eventId: '0',
          eventStatus: DeviceRegEventStatus.DEVICE_REG_EMAIL_OPENED,
        },
      },
      {
        assert: ndrEventGroup1[1],
        expected: {
          eventId: '0',
          eventStatus: DeviceRegEventStatus.DEVICE_REG_APPROVED,
        },
      },
      {
        assert: undefined,
        expected: {
          eventId: '0',
          eventStatus: LoginEventStatus.LOGIN_INITIATED,
        },
      },
    ];

    tests.forEach(({ assert, expected }) => {
      it(`Given event status of ${assert?.eventStatus}, should return ${expected.eventStatus}`, () => {
        expect(getPendingEvent(assert)).toEqual(expected);
      });
    });
  });

  describe('eventsToTimeline', () => {
    const tests: {
      desc: string;
      assert: EventLogLoginItem[];
      expected: TimelineEvent[];
    }[] = [
      {
        desc: 'correct timeline for single login initiated event',
        assert: eventGroup1,
        expected: timeline1,
      },
      {
        desc: 'correct timeline for two events',
        assert: eventGroup2,
        expected: timeline2,
      },
      {
        desc: 'correct timeline for three events',
        assert: eventGroup3,
        expected: timeline3,
      },
      {
        desc: 'correct timeline for four events',
        assert: eventGroup4,
        expected: timeline4,
      },
      {
        desc: 'correct timeline for five events',
        assert: eventGroup5,
        expected: timeline5,
      },
      {
        desc: 'correct timeline for email bounced event',
        assert: eventGroupBounced,
        expected: timelineBounced,
      },
      {
        desc: 'correct timeline when duplicate timestamps exist',
        assert: eventGroupDupedTimestamps,
        expected: timelineDupedTimestamp,
      },
      {
        desc: 'correct full timeline when duplicate timestamps exist',
        assert: eventGroupDupedTimestamps2,
        expected: timelineDupedTimestamp2,
      },
      {
        desc: 'correct full timeline with complete ndr group type',
        assert: ndrEventGroup1,
        expected: ndrTimeline1,
      },
      {
        desc: 'correct timeline with ndr group type four events',
        assert: [ndrEventGroup1[1], ndrEventGroup1[2], ndrEventGroup1[3], ndrEventGroup1[4]],
        expected: [
          {
            event: {
              eventId: '0',
              eventStatus: DeviceRegEventStatus.DEVICE_REG_APPROVED,
            },
            timelineStatus: TimelineStatus.PENDING,
          },
          ndrTimeline1[1],
          ndrTimeline1[2],
          ndrTimeline1[3],
          ndrTimeline1[4],
        ],
      },
      {
        desc: 'too many events will only use the 5 most recent',
        assert: [...eventGroup5, ...eventGroup1, ...eventGroup2],
        expected: timeline5,
      },
      {
        desc: 'correct timeline for zero events',
        assert: [],
        expected: [
          {
            event: {
              eventId: '0',
              eventStatus: LoginEventStatus.LOGIN_INITIATED,
            },
            timelineStatus: TimelineStatus.PENDING,
          },
        ],
      },
    ];

    tests.forEach(({ desc, assert, expected }) => {
      it(desc, () => {
        expect(eventsToTimeline(assert)).toEqual(expected);
      });
    });
  });

  describe('getEventDetails', () => {
    const tests: {
      desc: string;
      assert: [EventLogLoginItem[], boolean];
      expected: EventDetailData;
    }[] = [
      {
        desc: 'returns correct details with single event and no missing fields',
        assert: [eventGroup1, false],
        expected: eventDetailsData1,
      },
      {
        desc: 'returns correct details with single event and one missing field',
        assert: [
          [
            {
              ...eventGroup1[0],
              provider: EventLogProvider.POSTMARK,
              userAgent: undefined,
            },
          ],
          false,
        ],
        expected: {
          ...eventDetailsData1,
          provider: EventLogProvider.POSTMARK,
          userAgent: undefined,
        },
      },
      {
        desc: 'returns correct details when latest event has two missing fields',
        assert: [
          [
            {
              ...eventGroup2[0],
              ipAddress: undefined,
              userAgent: undefined,
            },
            eventGroup2[1],
          ],
          false,
        ],
        expected: eventDetailsData2,
      },
      {
        desc: 'returns correct details with several missing fields from different events',
        assert: [
          [
            {
              ...eventGroup5[0],
              ipAddress: undefined,
              userAgent: undefined,
              authUserId: undefined,
              provider: undefined,
            },
            {
              ...eventGroup5[1],
              ipAddress: undefined,
              userAgent: undefined,
              provider: undefined,
            },
            {
              ...eventGroup5[2],
              ipAddress: undefined,
              provider: undefined,
            },
            {
              ...eventGroup5[3],
              ipAddress: undefined,
            },
            eventGroup5[4],
          ],
          false,
        ],
        expected: eventDetailsData3,
      },
      {
        desc: 'returns correct details with all events with missing fields',
        assert: [
          [
            {
              ...eventGroup5[0],
              ipAddress: undefined,
              userAgent: undefined,
              authUserId: undefined,
              provider: undefined,
            },
            {
              ...eventGroup5[1],
              ipAddress: undefined,
              userAgent: undefined,
              authUserId: undefined,
              provider: undefined,
            },
            {
              ...eventGroup5[2],
              ipAddress: undefined,
              userAgent: undefined,
              authUserId: undefined,
              provider: undefined,
            },
            {
              ...eventGroup5[3],
              ipAddress: undefined,
              userAgent: undefined,
              authUserId: undefined,
              provider: undefined,
            },
            {
              ...eventGroup5[4],
              ipAddress: undefined,
              userAgent: undefined,
              authUserId: undefined,
              provider: undefined,
            },
          ],
          false,
        ],
        expected: {
          ...eventDetailsData3,
          userAgent: undefined,
          ipAddress: undefined,
          authUserId: undefined,
          provider: undefined,
        },
      },
      {
        desc: 'returns correct details with no missing fields',
        assert: [eventGroup5, false],
        expected: eventDetailsData4,
      },
      {
        desc: 'returns corrects details when latest event only has missing fields',
        assert: [
          [
            {
              ...eventGroup5[0],
              ipAddress: undefined,
              userAgent: undefined,
              authUserId: undefined,
              provider: undefined,
            },
            eventGroup5[1],
            eventGroup5[2],
            eventGroup5[3],
            eventGroup5[4],
          ],
          false,
        ],
        expected: eventDetailsData5,
      },
      {
        desc: 'returns correct details with custom smtp enabled',
        assert: [eventGroup1, true],
        expected: {
          ...eventDetailsData1,
          hasCustomSMTP: true,
        },
      },
    ];

    tests.forEach(({ desc, assert, expected }) => {
      it(desc, () => {
        expect(getEventDetails(...assert)).toEqual(expected);
      });
    });
  });
});
