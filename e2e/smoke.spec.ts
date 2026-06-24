import { expect, test } from "@playwright/test";

const movieFixture = {
    id: 550,
    title: "Fight Club",
    name: "Fight Club",
    poster_path: "/poster.jpg",
    backdrop_path: "/backdrop.jpg",
    vote_average: 8.4,
    overview: "Test overview",
    release_date: "1999-10-15",
    first_air_date: "1999-10-15",
};

const movieDetailsFixture = {
    id: 550,
    title: "Fight Club",
    overview: "Test",
    vote_average: 8.4,
    backdrop_path: "/b.jpg",
    runtime: 139,
    genres: [{ id: 18, name: "Drama" }],
    credits: { cast: [] },
    reviews: { results: [] },
    recommendations: { results: [] },
    images: { logos: [] },
    videos: { results: [] },
};

const tvFixture = {
    id: 1396,
    name: "Breaking Bad",
    poster_path: "/bb.jpg",
    backdrop_path: "/bb-back.jpg",
    vote_average: 9.5,
    overview: "TV test",
    first_air_date: "2008-01-20",
};

const tvDetailsFixture = {
    id: 1396,
    name: "Breaking Bad",
    overview: "TV test",
    vote_average: 9.5,
    backdrop_path: "/bb-back.jpg",
    number_of_seasons: 1,
    genres: [{ id: 18, name: "Drama" }],
    credits: { cast: [] },
    reviews: { results: [] },
    recommendations: { results: [] },
    images: { logos: [] },
    videos: { results: [] },
    seasons: [
        {
            id: 1,
            season_number: 1,
            name: "Season 1",
            episode_count: 2,
            poster_path: "/s1.jpg",
            overview: "Season one",
        },
    ],
};

const seasonFixture = {
    id: 1,
    name: "Season 1",
    season_number: 1,
    overview: "Season one",
    episodes: [
        {
            id: 10,
            name: "Pilot",
            episode_number: 1,
            overview: "First episode",
            still_path: "/ep1.jpg",
            runtime: 45,
        },
    ],
};

test.beforeEach(async ({ page }) => {
    await page.route("**/api/tmdb/**", async (route) => {
        const url = route.request().url();

        if (url.includes("/search/multi")) {
            return route.fulfill({
                json: {
                    page: 1,
                    total_pages: 1,
                    total_results: 1,
                    results: [{ ...movieFixture, media_type: "movie" }],
                },
            });
        }

        if (url.includes("/genre/")) {
            return route.fulfill({
                json: { genres: [{ id: 18, name: "Drama" }] },
            });
        }

        if (url.includes("/discover/") || url.includes("/trending/")) {
            return route.fulfill({
                json: {
                    page: 1,
                    total_pages: 1,
                    total_results: 1,
                    results: [movieFixture],
                },
            });
        }

        if (url.includes("/movie/550")) {
            return route.fulfill({ json: movieDetailsFixture });
        }

        if (url.includes("/tv/1396/season/1") && !url.includes("episode")) {
            return route.fulfill({ json: seasonFixture });
        }

        if (url.includes("/tv/1396")) {
            return route.fulfill({ json: tvDetailsFixture });
        }

        return route.fulfill({
            json: { page: 1, results: [], total_pages: 0, total_results: 0 },
        });
    });
});

test("home loads", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("nav")).toBeVisible();
});

test("home navigates to media details", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /see more/i }).first().click();
    await expect(page).toHaveURL(/\/media\/movie\/550/);
    await expect(page.getByRole("heading", { name: "Fight Club" })).toBeVisible();
});

test("search autocomplete navigates to details", async ({ page }, testInfo) => {
    await page.goto("/");
    const searchInput =
        testInfo.project.name === "chromium"
            ? page.getByPlaceholder("Search ...")
            : page.locator("aside").getByPlaceholder("Search ...");
    if (testInfo.project.name !== "chromium") {
        await page.getByLabel("Open menu").click();
    }
    await searchInput.fill("fight");
    await page.getByRole("button", { name: /fight club/i }).click();
    await expect(page).toHaveURL(/\/media\/movie\/550/);
});

test("tv season detail shows episodes", async ({ page }) => {
    await page.route("**/api/tmdb/**", async (route) => {
        const url = route.request().url();
        if (url.includes("/tv/1396/season/1")) {
            return route.fulfill({ json: seasonFixture });
        }
        if (url.includes("/tv/1396")) {
            return route.fulfill({ json: tvDetailsFixture });
        }
        return route.fulfill({
            json: { page: 1, results: [tvFixture], total_pages: 1, total_results: 1 },
        });
    });

    await page.goto("/media/tv/1396");
    await page.getByRole("link", { name: /season 1/i }).click();
    await expect(page).toHaveURL(/\/media\/tv\/1396\/season\/1/);
    await expect(page.getByText("Pilot")).toBeVisible();
});

test("mobile nav drawer opens", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");
    await page.getByLabel("Open menu").click();
    await expect(page.getByText("Menu")).toBeVisible();
});

test("guest login flow", async ({ page }) => {
    await page.route("**/api/auth/guest", (route) =>
        route.fulfill({ json: { success: true } }),
    );
    await page.goto("/login");
    await page.getByRole("button", { name: /browse as guest/i }).click();
    await expect(page).toHaveURL("/");
});
