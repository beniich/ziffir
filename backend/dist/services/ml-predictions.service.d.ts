export declare class MLPredictionsService {
    /**
     * Forecast d'occupation basé sur la moyenne mobile + saisonnalité simple
     * (Pour une V1, simulation d'un modèle SARIMA ou Prophet)
     */
    static forecastOccupancy(hotelId: string, daysToForecast?: number): Promise<{
        date: string;
        occupancyRate: number;
        confidence: number;
        recommendedPriceMultiplier: number;
    }[]>;
    /**
     * Détection d'anomalies sur le Room Service (Isolation Forest / Z-Score)
     */
    static detectAnomalies(hotelId: string): Promise<({
        type: string;
        amount: number;
        timestamp: Date;
        severity: string;
        description: string;
        count?: undefined;
    } | {
        type: string;
        count: number;
        timestamp: Date;
        severity: string;
        description: string;
        amount?: undefined;
    })[]>;
}
//# sourceMappingURL=ml-predictions.service.d.ts.map