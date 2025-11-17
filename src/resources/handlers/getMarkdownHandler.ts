import { BrowserManager } from "../../browser/BrowserManager.js";
import { GetMarkdownArgs, GetMarkdownResult } from "../../schema/resourcesSchema.js";
import { browserManagerExtensions } from "../../tools/toolsRegister.js";

export async function getMarkdownHandler(args: GetMarkdownArgs): Promise<GetMarkdownResult> {
  const startTime = Date.now();

  const browserManager = BrowserManager.getInstance();
  const page = browserManager.getPage(args.pageId);

  // Record resource invocation event
  await browserManagerExtensions.recordToolInvocation(args.pageId, 'get_markdown', args);

  // Get current page info
  const url = page.url();
  const title = await page.title();

  let markdown = "";

  if (args.selector) {
    // Convert specific element to markdown
    const element = await page.$(args.selector);
    if (!element) {
      throw new Error(`Element with selector "${args.selector}" not found`);
    }

    markdown = await page.evaluate(
      (selector, options) => {
        function convertToMarkdown(element: any, options: any) {
          let markdown = "";

          // Process child nodes
          for (let i = 0; i < element.childNodes.length; i++) {
            const node = element.childNodes[i];
            markdown += processNode(node, options);
          }

          // Clean up whitespace
          markdown = markdown.replace(/\n{3,}/g, '\n\n').trim();

          return markdown;
        }

        function processNode(node: any, options: any) {
          if (node.nodeType === Node.TEXT_NODE) {
            // Text node - clean and return
            return cleanText(node.textContent || '');
          }

          if (node.nodeType !== Node.ELEMENT_NODE) {
            return '';
          }

          const element = node;
          const tagName = element.tagName.toLowerCase();

          // Skip stripped tags
          if (options.stripTags.includes(tagName)) {
            return '';
          }

          // Handle different element types
          switch (tagName) {
            case 'h1':
              return options.includeHeadings ? `# ${getInnerText(element, options)}\n\n` : '';
            case 'h2':
              return options.includeHeadings ? `## ${getInnerText(element, options)}\n\n` : '';
            case 'h3':
              return options.includeHeadings ? `### ${getInnerText(element, options)}\n\n` : '';
            case 'h4':
              return options.includeHeadings ? `#### ${getInnerText(element, options)}\n\n` : '';
            case 'h5':
              return options.includeHeadings ? `##### ${getInnerText(element, options)}\n\n` : '';
            case 'h6':
              return options.includeHeadings ? `###### ${getInnerText(element, options)}\n\n` : '';

            case 'p':
              return `${getInnerText(element, options)}\n\n`;

            case 'br':
              return options.convertNewlines ? '\n' : '';

            case 'strong':
            case 'b':
              return `**${getInnerText(element, options)}**`;

            case 'em':
            case 'i':
              return `*${getInnerText(element, options)}*`;

            case 'code':
              if (element.parentElement?.tagName.toLowerCase() === 'pre') {
                // Already handled by pre tag
                return getInnerText(element, options);
              }
              return options.includeCode ? `\`${getInnerText(element, options)}\`` : getInnerText(element, options);

            case 'pre':
              if (options.includeCode) {
                const codeContent = element.textContent || '';
                return `\`\`\`\n${codeContent}\n\`\`\`\n\n`;
              }
              return '';

            case 'a':
              if (options.includeLinks) {
                const href = element.getAttribute('href') || '';
                const text = getInnerText(element, options);
                if (href && text) {
                  return `[${text}](${href})`;
                }
              }
              return getInnerText(element, options);

            case 'img':
              if (options.includeImages) {
                const src = element.getAttribute('src') || '';
                const alt = element.getAttribute('alt') || '';
                if (src) {
                  return `![${alt}](${src})`;
                }
              }
              return '';

            case 'ul':
              if (options.includeLists) {
                return processList(element, options, '-');
              }
              return '';

            case 'ol':
              if (options.includeLists) {
                return processList(element, options, '1.');
              }
              return '';

            case 'li':
              // Handled by parent list
              return getInnerText(element, options);

            case 'blockquote':
              const content = getInnerText(element, options);
              return content.split('\n').map(line => `> ${line}`).join('\n') + '\n\n';

            case 'hr':
              return '---\n\n';

            case 'table':
              if (options.includeTables) {
                return processTable(element, options);
              }
              return '';

            case 'tr':
            case 'td':
            case 'th':
              // Handled by parent table
              return getInnerText(element, options);

            case 'div':
            case 'span':
            case 'section':
            case 'article':
            case 'header':
            case 'footer':
            case 'nav':
            case 'main':
              // Container elements - just process children
              return getInnerText(element, options);

            default:
              // Unknown element - process children
              return getInnerText(element, options);
          }
        }

        function getInnerText(element: any, options: any) {
          let text = '';
          for (let i = 0; i < element.childNodes.length; i++) {
            text += processNode(element.childNodes[i], options);
          }
          return text;
        }

        function processList(listElement: any, options: any, bullet: string) {
          let markdown = '';
          const items = listElement.querySelectorAll('li');

          for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const content = getInnerText(item, options);
            const prefix = bullet === '1.' ? `${i + 1}.` : bullet;
            markdown += `${prefix} ${content}\n`;
          }

          return markdown + '\n';
        }

        function processTable(tableElement: any, options: any) {
          const rows = tableElement.querySelectorAll('tr');
          if (rows.length === 0) return '';

          let markdown = '';
          const headerRow = rows[0];
          const headers = headerRow.querySelectorAll('th, td');

          // Header row
          markdown += '| ' + Array.from(headers).map(header =>
            getInnerText(header, options).trim()
          ).join(' | ') + ' |\n';

          // Separator row
          markdown += '| ' + Array.from(headers).map(() => '---').join(' | ') + ' |\n';

          // Data rows
          for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            const cells = row.querySelectorAll('td');
            markdown += '| ' + Array.from(cells).map(cell =>
              getInnerText(cell, options).trim()
            ).join(' | ') + ' |\n';
          }

          return markdown + '\n';
        }

        function cleanText(text: string) {
          return text
            .replace(/\s+/g, ' ') // Normalize whitespace
            .replace(/^\s+|\s+$/g, '') // Trim
            .replace(/[\u200B-\u200D\uFEFF]/g, ''); // Remove zero-width characters
        }

        const element = document.querySelector(selector);
        if (!element) return "";

        return convertToMarkdown(element, options);
      },
      args.selector,
      {
        includeImages: args.includeImages,
        includeLinks: args.includeLinks,
        includeHeadings: args.includeHeadings,
        includeLists: args.includeLists,
        includeTables: args.includeTables,
        includeCode: args.includeCode,
        stripTags: args.stripTags,
        convertNewlines: args.convertNewlines,
      }
    );
  } else {
    // Convert entire page to markdown
    markdown = await page.evaluate((options) => {
      function convertToMarkdown(element: any, options: any) {
        let markdown = "";

        // Process child nodes
        for (let i = 0; i < element.childNodes.length; i++) {
          const node = element.childNodes[i];
          markdown += processNode(node, options);
        }

        // Clean up whitespace
        markdown = markdown.replace(/\n{3,}/g, '\n\n').trim();

        return markdown;
      }

      function processNode(node: any, options: any) {
        if (node.nodeType === Node.TEXT_NODE) {
          // Text node - clean and return
          return cleanText(node.textContent || '');
        }

        if (node.nodeType !== Node.ELEMENT_NODE) {
          return '';
        }

        const element = node;
        const tagName = element.tagName.toLowerCase();

        // Skip stripped tags
        if (options.stripTags.includes(tagName)) {
          return '';
        }

        // Handle different element types
        switch (tagName) {
          case 'h1':
            return options.includeHeadings ? `# ${getInnerText(element, options)}\n\n` : '';
          case 'h2':
            return options.includeHeadings ? `## ${getInnerText(element, options)}\n\n` : '';
          case 'h3':
            return options.includeHeadings ? `### ${getInnerText(element, options)}\n\n` : '';
          case 'h4':
            return options.includeHeadings ? `#### ${getInnerText(element, options)}\n\n` : '';
          case 'h5':
            return options.includeHeadings ? `##### ${getInnerText(element, options)}\n\n` : '';
          case 'h6':
            return options.includeHeadings ? `###### ${getInnerText(element, options)}\n\n` : '';

          case 'p':
            return `${getInnerText(element, options)}\n\n`;

          case 'br':
            return options.convertNewlines ? '\n' : '';

          case 'strong':
          case 'b':
            return `**${getInnerText(element, options)}**`;

          case 'em':
          case 'i':
            return `*${getInnerText(element, options)}*`;

          case 'code':
            if (element.parentElement?.tagName.toLowerCase() === 'pre') {
              // Already handled by pre tag
              return getInnerText(element, options);
            }
            return options.includeCode ? `\`${getInnerText(element, options)}\`` : getInnerText(element, options);

          case 'pre':
            if (options.includeCode) {
              const codeContent = element.textContent || '';
              return `\`\`\`\n${codeContent}\n\`\`\`\n\n`;
            }
            return '';

          case 'a':
            if (options.includeLinks) {
              const href = element.getAttribute('href') || '';
              const text = getInnerText(element, options);
              if (href && text) {
                return `[${text}](${href})`;
              }
            }
            return getInnerText(element, options);

          case 'img':
            if (options.includeImages) {
              const src = element.getAttribute('src') || '';
              const alt = element.getAttribute('alt') || '';
              if (src) {
                return `![${alt}](${src})`;
              }
            }
            return '';

          case 'ul':
            if (options.includeLists) {
              return processList(element, options, '-');
            }
            return '';

          case 'ol':
            if (options.includeLists) {
              return processList(element, options, '1.');
            }
            return '';

          case 'li':
            // Handled by parent list
            return getInnerText(element, options);

          case 'blockquote':
            const content = getInnerText(element, options);
            return content.split('\n').map(line => `> ${line}`).join('\n') + '\n\n';

          case 'hr':
            return '---\n\n';

          case 'table':
            if (options.includeTables) {
              return processTable(element, options);
            }
            return '';

          case 'tr':
          case 'td':
          case 'th':
            // Handled by parent table
            return getInnerText(element, options);

          case 'div':
          case 'span':
          case 'section':
          case 'article':
          case 'header':
          case 'footer':
          case 'nav':
          case 'main':
            // Container elements - just process children
            return getInnerText(element, options);

          default:
            // Unknown element - process children
            return getInnerText(element, options);
        }
      }

      function getInnerText(element: any, options: any) {
        let text = '';
        for (let i = 0; i < element.childNodes.length; i++) {
          text += processNode(element.childNodes[i], options);
        }
        return text;
      }

      function processList(listElement: any, options: any, bullet: string) {
        let markdown = '';
        const items = listElement.querySelectorAll('li');

        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          const content = getInnerText(item, options);
          const prefix = bullet === '1.' ? `${i + 1}.` : bullet;
          markdown += `${prefix} ${content}\n`;
        }

        return markdown + '\n';
      }

      function processTable(tableElement: any, options: any) {
        const rows = tableElement.querySelectorAll('tr');
        if (rows.length === 0) return '';

        let markdown = '';
        const headerRow = rows[0];
        const headers = headerRow.querySelectorAll('th, td');

        // Header row
        markdown += '| ' + Array.from(headers).map(header =>
          getInnerText(header, options).trim()
        ).join(' | ') + ' |\n';

        // Separator row
        markdown += '| ' + Array.from(headers).map(() => '---').join(' | ') + ' |\n';

        // Data rows
        for (let i = 1; i < rows.length; i++) {
          const row = rows[i];
          const cells = row.querySelectorAll('td');
          markdown += '| ' + Array.from(cells).map(cell =>
            getInnerText(cell, options).trim()
          ).join(' | ') + ' |\n';
        }

        return markdown + '\n';
      }

      function cleanText(text: string) {
        return text
          .replace(/\s+/g, ' ') // Normalize whitespace
          .replace(/^\s+|\s+$/g, '') // Trim
          .replace(/[\u200B-\u200D\uFEFF]/g, ''); // Remove zero-width characters
      }

      return convertToMarkdown(document.body, options);
    }, {
      includeImages: args.includeImages,
      includeLinks: args.includeLinks,
      includeHeadings: args.includeHeadings,
      includeLists: args.includeLists,
      includeTables: args.includeTables,
      includeCode: args.includeCode,
      stripTags: args.stripTags,
      convertNewlines: args.convertNewlines,
    });
  }

  // Add page title as header if available
  if (title && !args.selector) {
    markdown = `# ${title}\n\n${markdown}`;
  }

  // Count words and characters
  const wordCount = markdown.split(/\s+/).filter(word => word.length > 0).length;
  const characterCount = markdown.length;

  const result = {
    pageId: args.pageId,
    url,
    title,
    markdown,
    selector: args.selector,
    wordCount,
    characterCount,
  };

  const executionTime = Date.now() - startTime;

  // Record resource result event
  await browserManagerExtensions.recordToolResult(args.pageId, 'get_markdown', {
    pageId: args.pageId,
    url,
    title,
    selector: args.selector,
    wordCount,
    characterCount,
    includeImages: args.includeImages,
    includeLinks: args.includeLinks,
    includeHeadings: args.includeHeadings,
    includeLists: args.includeLists,
    includeTables: args.includeTables,
    includeCode: args.includeCode
  }, executionTime);

  return result;
}