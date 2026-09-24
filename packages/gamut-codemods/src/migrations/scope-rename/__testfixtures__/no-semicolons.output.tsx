import { Box } from '@skillsoft/gamut'

jest.mock('./Card', () => {
  return ({ title, description }: any) => (
    <div>
      {title} - {description}
    </div>
  )
})

jest.mock("@skillsoft/gamut-icons", () => ({
  AiEditSparkIcon: () => <div>AI Icon</div>,
}))
