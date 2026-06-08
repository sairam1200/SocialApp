import { Get, Post, Body } from "restfit";
import { OnboardingResponseType, OnboardingStatusResponseType, TopicsResponseType } from "@/types/auth/Onboarding.type";
import {
    SaveStep1Request,
    SaveStep2Request,
    SaveStep3Request,
    CompleteStep4Request,
} from "@/types/account/onboardingRequest.type";
export class OnboardingService {

    @Get<SaveStep1Request>("/onboarding/step1")
    async getStep1Async(): Promise<SaveStep1Request> {
        return {} as SaveStep1Request;
    }

    @Post("/onboarding/step1")
    async saveStep1Async(
        @Body() body: SaveStep1Request
    ) {
        return {};
    }

    @Get("/onboarding/step2")
    async getStep2Async() {
        return {};
    }

    @Post("/onboarding/step2")
    async saveStep2Async(
        @Body() body: SaveStep2Request
    ) {
        return {};
    }

    @Get("/onboarding/step3")
    async getStep3Async() {
        return {};
    }

    @Post<OnboardingResponseType>("/onboarding/step3")
    async saveStep3Async(
        @Body() body: SaveStep3Request
    ): Promise<OnboardingResponseType> {
        return {} as OnboardingResponseType;
    }

    @Get("/onboarding/step4")
    async getStep4Async() {
        return {};
    }

    @Post<OnboardingStatusResponseType>("/onboarding/step4")
    async completeStep4Async(
        @Body() body: CompleteStep4Request
    ): Promise<OnboardingStatusResponseType> {
        return {} as OnboardingStatusResponseType;
    }

    @Get("/onboarding/status")
    async getStatusAsync() {
        return {};
    }

    @Get<TopicsResponseType>("/onboarding/topics")
    async getTopicsAsync(): Promise<TopicsResponseType> {
        return {} as TopicsResponseType;
    }
}