export declare const triggerWebhook: import('ai').Tool<
    {
        body?: string;
        method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
        url?: string;
    },
    | {
          success: boolean;
          error: string;
          status?: undefined;
          data?: undefined;
      }
    | {
          success: boolean;
          status: number;
          error: string;
          data?: undefined;
      }
    | {
          success: boolean;
          status: number;
          data: any;
          error?: undefined;
      }
>;
