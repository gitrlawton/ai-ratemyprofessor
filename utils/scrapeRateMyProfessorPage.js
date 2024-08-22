import * as cheerio from 'cheerio';
import puppeteer from 'puppeteer'; 

export async function scrapeRateMyProfessorPage(url) {
  try {
    const browser = await puppeteer.launch({ headless: true, slowMo: 250 });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    const loadMoreButtonSelector = '.Buttons__Button-sc-19xdot-1';
    
    let hasMoreContent = true;
    while (hasMoreContent) {
      try {
        // Wait for the button to be visible and clickable
        await page.waitForFunction(selector => {
          const button = document.querySelector(selector);
          return button && button.offsetParent !== null && !button.disabled;
        }, { timeout: 5000 }, loadMoreButtonSelector);

        console.log('Load More button found, attempting to click.');

        // Log button state before clicking
        await logButtonState(page, loadMoreButtonSelector);

        await page.evaluate(selector => {
          const button = document.querySelector(selector);
          if (button) {
            button.scrollIntoView();
            button.click();
          }
        }, loadMoreButtonSelector);

        console.log('Clicked Load More, waiting for more content...');

        // Wait for new content to load
        await page.waitForFunction(() => {
          // Check for a visible change indicating more content has loaded
          return document.querySelector('.Comments__StyledComments-dzzyvm-0') !== null;
        });

        // Log button state after clicking
        await logButtonState(page, loadMoreButtonSelector);

      } catch (error) {
        console.error('Error while interacting with Load More button:', error);
        console.log('No more "Load More" button found, assuming all content is loaded.');
        hasMoreContent = false;
      }
    }

    const data = await page.content();
    const $ = cheerio.load(data);

    await browser.close();

    const professorName = $('.NameTitle__Name-dowf0z-0').text().trimEnd();
    
    const ratingsQuality = $('.CardNumRating__CardNumRatingNumber-sc-17t4b9u-2')
        .map((i, el) => (i % 2 === 0 ? parseFloat($(el).text()) : null))
        .get()
        .filter(rating => rating !== null);

    const ratingsDifficulty = $('.CardNumRating__CardNumRatingNumber-sc-17t4b9u-2')
        .map((i, el) => (i % 2 !== 0 ? parseFloat($(el).text()) : null))
        .get()
        .filter(rating => rating !== null);

    const reviews = $('.Comments__StyledComments-dzzyvm-0').map((i, el) => $(el).text()).get();

    return { professorName, ratingsQuality, ratingsDifficulty, reviews };
  } catch (error) {
    console.error('Error scraping the page:', error);
    return null;
  }
}

async function logButtonState(page, selector) {
  try {
    const buttonState = await page.evaluate(selector => {
      const button = document.querySelector(selector);
      return button ? { visible: button.offsetParent !== null, disabled: button.disabled, html: button.outerHTML } : null;
    }, selector);
    console.log('Button state:', buttonState);
  } catch (error) {
    console.error('Error logging button state:', error);
  }
}