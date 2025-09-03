
import { Poll } from '@/types';
import {
    calculatePollResults,
    isPollExpired,
    getPollStatus,
    validatePollOptions,
} from '../poll';

describe('poll utils', () => {
    describe('calculatePollResults', () => {
        it('should correctly calculate poll results', () => {
            const poll = {
                options: [
                    { id: '1', vote_count: 5 },
                    { id: '2', vote_count: 10 },
                    { id: '3', vote_count: 5 },
                ],
            } as Poll;
            const results = calculatePollResults(poll);
            expect(results).toEqual([
                { id: '1', vote_count: 5, votes: 5, percentage: 25 },
                { id: '2', vote_count: 10, votes: 10, percentage: 50 },
                { id: '3', vote_count: 5, votes: 5, percentage: 25 },
            ]);
        });

        it('should handle zero votes', () => {
            const poll = {
                options: [
                    { id: '1', vote_count: 0 },
                    { id: '2', vote_count: 0 },
                ],
            } as Poll;
            const results = calculatePollResults(poll);
            expect(results).toEqual([
                { id: '1', vote_count: 0, votes: 0, percentage: 0 },
                { id: '2', vote_count: 0, votes: 0, percentage: 0 },
            ]);
        });
    });

    describe('isPollExpired', () => {
        it('should return true for expired poll', () => {
            const poll = { expires_at: new Date(Date.now() - 1000).toISOString() } as Poll;
            expect(isPollExpired(poll)).toBe(true);
        });

        it('should return false for active poll', () => {
            const poll = { expires_at: new Date(Date.now() + 10000).toISOString() } as Poll;
            expect(isPollExpired(poll)).toBe(false);
        });
    });

    describe('getPollStatus', () => {
        it('should return "active" for an ongoing poll', () => {
            const poll = { expires_at: new Date(Date.now() + 10000).toISOString() } as Poll;
            expect(getPollStatus(poll)).toBe('active');
        });

        it('should return "expired" for a past poll', () => {
            const poll = { expires_at: new Date(Date.now() - 1000).toISOString() } as Poll;
            expect(getPollStatus(poll)).toBe('expired');
        });
    });

    describe('validatePollOptions', () => {
        it('should return unique and non-empty options', () => {
            const options = ['Option 1', 'Option 2', ' Option 1 ', ''];
            expect(validatePollOptions(options)).toEqual(['Option 1', 'Option 2']);
        });

        it('should handle a single option', () => {
            const options = ['Option 1'];
            expect(validatePollOptions(options)).toEqual(['Option 1']);
        });

        it('should handle duplicate options with different cases', () => {
            const options = ['Option 1', 'option 1'];
            expect(validatePollOptions(options)).toEqual(['Option 1']);
        });
    });
});