package com.ecoreward.rewards.controller;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HomeController {

    @GetMapping(value = "/", produces = MediaType.TEXT_HTML_VALUE)
    public String home() {
        return """
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>EcoReward Microservice — Spring Boot 3</title>
                <link rel="preconnect" href="https://fonts.googleapis.com">
                <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;800;900&display=swap" rel="stylesheet">
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Plus Jakarta Sans', sans-serif; }
                    body { background: #090d16; color: #e2e8f0; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; }
                    .card { background: #111827; border: 1px solid #1f293d; border-radius: 28px; max-width: 720px; width: 100%; padding: 40px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); }
                    .badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(16, 185, 129, 0.12); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.25); padding: 6px 14px; border-radius: 9999px; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; }
                    .dot { width: 8px; height: 8px; background: #10b981; border-radius: 50%; box-shadow: 0 0 10px #10b981; }
                    h1 { font-size: 30px; font-weight: 900; margin: 18px 0 8px; color: #ffffff; letter-spacing: -0.02em; }
                    p.desc { font-size: 14px; color: #94a3b8; line-height: 1.6; margin-bottom: 28px; }
                    .endpoints { display: flex; flex-direction: column; gap: 12px; margin-bottom: 30px; }
                    .endpoint-row { display: flex; align-items: center; justify-content: space-between; background: #0b1120; border: 1px solid #1e293b; padding: 14px 18px; border-radius: 16px; font-size: 13px; text-decoration: none; color: inherit; transition: all 0.2s ease; }
                    .endpoint-row:hover { border-color: #10b981; transform: translateY(-1px); background: #0f172a; }
                    .method { font-weight: 800; font-size: 11px; padding: 4px 8px; border-radius: 8px; letter-spacing: 0.05em; }
                    .get { background: rgba(59, 130, 246, 0.15); color: #60a5fa; }
                    .post { background: rgba(245, 158, 11, 0.15); color: #fbbf24; }
                    .uri { font-family: monospace; font-weight: 700; color: #f1f5f9; margin-left: 10px; }
                    .btn { display: inline-flex; align-items: center; justify-content: center; gap: 10px; background: linear-gradient(135deg, #059669, #0d9488); color: #ffffff; padding: 14px 24px; border-radius: 18px; font-weight: 800; font-size: 14px; text-decoration: none; box-shadow: 0 10px 25px -5px rgba(16, 185, 129, 0.4); transition: transform 0.15s ease; }
                    .btn:hover { transform: scale(1.02); }
                    .footer { border-top: 1px solid #1e293b; padding-top: 20px; font-size: 12px; color: #64748b; display: flex; justify-content: space-between; align-items: center; }
                </style>
            </head>
            <body>
                <div class="card">
                    <div class="badge">
                        <div class="dot"></div>
                        <span>Spring Boot 3.2.3 Microservice Online</span>
                    </div>
                    <h1>🍃 EcoReward Redemption Service</h1>
                    <p class="desc">
                        High-performance Java 21 REST backend service for real-world environmental incentives, CMRL Metro passes, Tata Power/Ather EV credits, and utility rebates.
                    </p>

                    <h3 style="font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; margin-bottom: 12px; font-weight: 800;">Available REST Endpoints</h3>
                    <div class="endpoints">
                        <a class="endpoint-row" href="/api/v1/rewards/catalog" target="_blank">
                            <div>
                                <span class="method get">GET</span>
                                <span class="uri">/api/v1/rewards/catalog</span>
                            </div>
                            <span style="color: #94a3b8; font-size: 12px;">Active Eco Catalog &rarr;</span>
                        </a>
                        <a class="endpoint-row" href="/api/v1/rewards/impact" target="_blank">
                            <div>
                                <span class="method get">GET</span>
                                <span class="uri">/api/v1/rewards/impact</span>
                            </div>
                            <span style="color: #94a3b8; font-size: 12px;">Community Impact Stats &rarr;</span>
                        </a>
                        <a class="endpoint-row" href="/api/v1/rewards/health" target="_blank">
                            <div>
                                <span class="method get">GET</span>
                                <span class="uri">/api/v1/rewards/health</span>
                            </div>
                            <span style="color: #94a3b8; font-size: 12px;">Service Health Check &rarr;</span>
                        </a>
                        <div class="endpoint-row" style="cursor: default;">
                            <div>
                                <span class="method post">POST</span>
                                <span class="uri">/api/v1/rewards/redeem</span>
                            </div>
                            <span style="color: #94a3b8; font-size: 12px;">Claims & Token Issuance</span>
                        </div>
                    </div>

                    <div style="display: flex; gap: 14px; align-items: center; flex-wrap: wrap; margin-bottom: 24px;">
                        <a href="http://localhost:5173/rewards" class="btn">
                            <span>Open EcoReward React App</span>
                            <span>&rarr;</span>
                        </a>
                        <a href="/api/v1/rewards/catalog" class="btn" style="background: #1e293b; box-shadow: none; border: 1px solid #334155;">
                            <span>View Raw JSON Catalog</span>
                        </a>
                    </div>

                    <div class="footer">
                        <span>Runtime: Java 21 LTS | Port: 8085</span>
                        <span>EcoReward Systems © 2026</span>
                    </div>
                </div>
            </body>
            </html>
            """;
    }
}
