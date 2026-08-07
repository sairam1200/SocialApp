/* eslint-disable @typescript-eslint/no-unused-vars */
import { Body, Post } from "restfit";
import { NewsletterSubscribeResult } from "@/types/newsletter.type";

export class NewsletterService {
  @Post("/newsletter/subscribe")
  async subscribeAsync(
    @Body() body: { email: string }
  ): Promise<NewsletterSubscribeResult> {
    return {} as NewsletterSubscribeResult;
  }
}
