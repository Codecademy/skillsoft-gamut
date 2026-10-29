import type { Meta, StoryObj } from '@storybook/react';
import { useCallback, useState } from 'react';
import { expect, fn, waitFor } from 'storybook/test';

import { FlexBox } from '../Box';
import { FormGroup, Input } from '../Form';
import type { PaginationProps } from '.';
import { Pagination } from '.';

const meta: Meta<typeof Pagination> = {
  title: 'Navigation/Pagination',
  component: Pagination,
  args: {
    onChange: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof Pagination>;

const backButtonName = /Navigate back to page \d+/;

const forwardButtonName = /Navigate forward to page \d+/;

export const Default: Story = {
  args: {
    chapterSize: 5,
    totalPages: 8,
  },
  play: async ({ args, canvas, userEvent }) => {
    const page1 = canvas.getByRole('button', { name: 'Page 1' });
    await expect(page1).toHaveAttribute('aria-current', 'page');
    await expect(
      canvas.queryByRole('button', { name: backButtonName })
    ).toBeNull();
    await expect(canvas.queryByRole('button', { name: /Jump/ })).toBeNull();

    const page2 = canvas.getByRole('button', { name: 'Page 2' });
    await userEvent.click(page2);
    await expect(page1).toHaveAttribute('aria-current', 'false');
    await expect(page2).toHaveAttribute('aria-current', 'page');
    await expect(args.onChange).toHaveBeenLastCalledWith(2);

    await userEvent.click(
      await canvas.findByRole('button', { name: 'Navigate back to page 1' })
    );
    await expect(page1).toHaveAttribute('aria-current', 'page');
    await expect(args.onChange).toHaveBeenLastCalledWith(1);

    await userEvent.click(
      canvas.getByRole('button', { name: 'Navigate forward to page 2' })
    );
    await expect(page2).toHaveAttribute('aria-current', 'page');
    await expect(args.onChange).toHaveBeenLastCalledWith(2);
    await expect(args.onChange).toHaveBeenCalledTimes(3);

    canvas.getByRole('button', { name: backButtonName });
    canvas.getByRole('button', { name: forwardButtonName });

    await userEvent.click(canvas.getByRole('button', { name: 'Page 5' }));
    await userEvent.click(
      canvas.getByRole('button', { name: 'Navigate forward to page 6' })
    );

    const lastPage = canvas.getByRole('button', { name: 'Last Page, Page 8' });
    await userEvent.click(lastPage);
    await expect(lastPage).toHaveAttribute('aria-current', 'page');
    await expect(
      canvas.queryByRole('button', { name: forwardButtonName })
    ).toBeNull();

    await userEvent.click(
      canvas.getByRole('button', { name: 'Navigate back to page 7' })
    );
    await expect(
      canvas.getByRole('button', { name: 'Page 7' })
    ).toHaveAttribute('aria-current', 'page');
  },
};

export const ChapterSize: Story = {
  args: {
    chapterSize: 3,
    totalPages: 10,
    type: 'basic',
  },
  play: async ({ canvas, userEvent }) => {
    canvas.getByRole('button', { name: 'Page 1' });
    canvas.getByRole('button', { name: 'Page 3' });
    await expect(canvas.queryByRole('button', { name: 'Page 4' })).toBeNull();

    await userEvent.click(canvas.getByRole('button', { name: 'Page 3' }));
    await userEvent.click(
      await canvas.findByRole('button', { name: 'Navigate forward to page 4' })
    );

    await expect(
      canvas.getByRole('button', { name: 'Page 4' })
    ).toHaveAttribute('aria-current', 'page');
    canvas.getByRole('button', { name: 'Page 5' });
    canvas.getByRole('button', { name: 'Page 6' });
    await expect(canvas.queryByRole('button', { name: 'Page 3' })).toBeNull();
    await expect(canvas.getAllByRole('button')).toHaveLength(5);
  },
};

export const IncludeSkipToButtons: Story = {
  args: {
    chapterSize: 5,
    totalPages: 20,
  },
  play: async ({ args, canvas, userEvent }) => {
    await expect(canvas.getAllByLabelText(/Jump /)).toHaveLength(2);
    await expect(canvas.queryByLabelText(/Jump back /)).toBeNull();

    await userEvent.click(canvas.getByLabelText('Jump forward to page 6'));
    await expect(
      canvas.getByRole('button', { name: 'Page 6' })
    ).toHaveAttribute('aria-current', 'page');
    await expect(args.onChange).toHaveBeenLastCalledWith(6);
    await waitFor(() =>
      expect(canvas.queryByRole('button', { name: 'Page 1' })).toBeNull()
    );
    await expect(canvas.getAllByLabelText(/Jump /)).toHaveLength(4);

    await userEvent.click(canvas.getByLabelText('Jump forward to page 11'));
    await expect(args.onChange).toHaveBeenLastCalledWith(11);

    const jumpForward = canvas.getByLabelText('Jump forward to page 16');
    await userEvent.unhover(jumpForward);
    await expect(jumpForward).toHaveTextContent('•••');
    await userEvent.hover(jumpForward);
    await expect(jumpForward).toHaveTextContent('»');
    await userEvent.unhover(jumpForward);
    await expect(jumpForward).toHaveTextContent('•••');

    const jumpBack = canvas.getByLabelText('Jump back to page 6');
    await expect(jumpBack).toHaveTextContent('•••');
    await userEvent.hover(jumpBack);
    await expect(jumpBack).toHaveTextContent('«');
    await userEvent.unhover(jumpBack);
    await expect(jumpBack).toHaveTextContent('•••');

    await userEvent.click(jumpBack);
    await expect(
      canvas.getByRole('button', { name: 'Page 6' })
    ).toHaveAttribute('aria-current', 'page');
    await expect(args.onChange).toHaveBeenLastCalledWith(6);

    await userEvent.click(
      canvas.getByLabelText('Jump forward to last page, page 20')
    );
    await expect(
      canvas.getByRole('button', { name: 'Last Page, Page 20' })
    ).toHaveAttribute('aria-current', 'page');
    await expect(args.onChange).toHaveBeenLastCalledWith(20);
    await waitFor(() =>
      expect(canvas.queryByLabelText(/Jump forward /)).toBeNull()
    );
  },
};

export const Stroke: Story = {
  args: {
    chapterSize: 5,
    totalPages: 18,
  },
};

export const Text: Story = {
  args: {
    chapterSize: 5,
    totalPages: 20,
    variant: 'text',
  },
};

export const Navigation: Story = {
  args: {
    chapterSize: 5,
    totalPages: 27,
    isNavigation: true,
    onChange: (pageNumber) => {
      window.open(
        `https://giphy.com/search/hamtaro-page-${pageNumber}`,
        '_blank'
      );
    },
  },
  play: async ({ canvas }) => {
    canvas.getByRole('navigation', {
      name: 'Browse Content By Page, total pages 27',
    });
    await expect(canvas.getByRole('link', { name: 'Page 1' })).toHaveAttribute(
      'href',
      '/'
    );
  },
};

export const ControlledPageNumber: Story = {
  args: {
    chapterSize: 3,
    pageNumber: 5,
    totalPages: 10,
    type: 'basic',
  },
  play: async ({ args, canvas, userEvent }) => {
    const page5 = canvas.getByRole('button', { name: 'Page 5' });
    await expect(page5).toHaveAttribute('aria-current', 'page');
    canvas.getByRole('button', { name: 'Page 6' });
    canvas.getByRole('button', { name: 'Page 7' });
    await expect(canvas.getAllByRole('button')).toHaveLength(5);

    await userEvent.click(page5);
    await expect(args.onChange).toHaveBeenLastCalledWith(5);
  },
};

const PaginationControlledExample: React.FC<PaginationProps> = (props) => {
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(3);

  const setChangedPage = useCallback(
    (pg: number) => {
      const page = Number(pg);
      if (page > totalPages) return setPageNumber(1);
      if (page <= 0) return setPageNumber(totalPages);
      if (page !== pageNumber) setPageNumber(page);
    },
    [totalPages, pageNumber, setPageNumber]
  );

  const setChangedTotalPages = useCallback(
    (page: string) => {
      setTotalPages(Number(page));
    },
    [setTotalPages]
  );

  return (
    <>
      <FlexBox justifyContent="center" mb={24} p={12}>
        <FormGroup htmlFor="current-page" label="Current Page">
          <Input
            htmlFor="current-page"
            label="current page"
            min={1}
            type="number"
            value={pageNumber}
            onChange={(e) => setChangedPage(Number(e.target.value))}
          />
        </FormGroup>
        <FormGroup htmlFor="total-pages" label="Total Pages">
          <Input
            htmlFor="total-pages"
            label="total pages"
            min={1}
            type="number"
            value={totalPages}
            onChange={(e) => setChangedTotalPages(e.target.value)}
          />
        </FormGroup>
      </FlexBox>
      <Pagination
        {...props}
        pageNumber={pageNumber}
        totalPages={totalPages}
        onChange={setChangedPage}
      />
    </>
  );
};

export const Controlled: Story = {
  args: {
    chapterSize: 5,
    totalPages: 27,
  },
  render: (args) => <PaginationControlledExample {...args} />,
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(
      canvas.getByRole('button', { name: 'Last Page, Page 3' })
    );
    const currentPageInput = canvas.getByRole('spinbutton', {
      name: /Current Page/,
    });
    await expect(currentPageInput).toHaveValue(3);

    await userEvent.click(
      canvas.getByRole('button', { name: 'Navigate back to page 2' })
    );
    await expect(currentPageInput).toHaveValue(2);
    await expect(
      canvas.getByRole('button', { name: 'Page 2' })
    ).toHaveAttribute('aria-current', 'page');
  },
};
