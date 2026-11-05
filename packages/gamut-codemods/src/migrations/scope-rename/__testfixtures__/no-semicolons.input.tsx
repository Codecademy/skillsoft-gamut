import { Box } from '@codecademy/gamut'

jest.mock('./Card', () => {
  return ({ title, description }: any) => (
    <div>
      {title} - {description}
    </div>
  )
})

jest.mock("@codecademy/gamut-icons", () => ({
  AiEditSparkIcon: () => <div>AI Icon</div>,
}))
