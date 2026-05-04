import { generateText, Output } from 'ai';
import { z } from 'zod';

const roleSchema = z.object({
  title: z.string().describe('Job title extracted from the description'),
  company: z.string().nullable().describe('Company name if mentioned'),
  location: z.string().nullable().describe('Job location (city, state, country)'),
  workMode: z.enum(['Remote', 'Hybrid', 'Onsite']).describe('Remote, Hybrid, or Onsite'),
  seniority: z.enum(['Junior', 'Mid', 'Senior', 'Staff / Principal', 'Lead / Head of']).describe('Experience level'),
  salaryMin: z.number().nullable().describe('Minimum salary in USD (annual)'),
  salaryMax: z.number().nullable().describe('Maximum salary in USD (annual)'),
  salaryRange: z.string().nullable().describe('Formatted salary range like "$160k-200k" or "$180,000-$220,000"'),
  description: z.string().describe('Clean summary of the role (2-3 paragraphs)'),
  requirements: z.string().describe('Key requirements and qualifications as bullet points'),
  mustHaveSkills: z.array(z.string()).describe('Must-have technical skills (5-8 items)'),
  niceToHaveSkills: z.array(z.string()).describe('Nice-to-have skills (3-5 items)'),
  benefits: z.array(z.string()).describe('Listed benefits and perks'),
  teamSize: z.string().nullable().describe('Team size if mentioned'),
  reportsTo: z.string().nullable().describe('Who this role reports to'),
  hiringManager: z.string().nullable().describe('Hiring manager name if mentioned'),
});

export async function POST(req: Request) {
  try {
    const { jobDescription } = await req.json();

    if (!jobDescription || typeof jobDescription !== 'string') {
      return Response.json({ error: 'Job description is required' }, { status: 400 });
    }

    const result = await generateText({
      model: 'anthropic/claude-sonnet-4-20250514',
      output: Output.object({ schema: roleSchema }),
      prompt: `You are an expert recruiter AI that analyzes job descriptions and extracts structured information.

Analyze the following job description and extract all relevant information. Be thorough and accurate.

For salary:
- If a range is given, extract both min and max
- Convert hourly rates to annual (multiply by 2080)
- If only one number is given, use it for both min and max
- Format salaryRange nicely like "$150k-180k" or "$150,000-$180,000"

For skills:
- Separate must-have (required) from nice-to-have (preferred/bonus)
- Include specific technologies, frameworks, and tools
- Keep skills concise (1-3 words each)

For seniority:
- Junior: 0-2 years
- Mid: 2-5 years
- Senior: 5-8 years
- Staff / Principal: 8+ years or architect-level
- Lead / Head of: Management or leadership role

JOB DESCRIPTION:
${jobDescription}`,
    });

    return Response.json({ role: result.output });
  } catch (error: any) {
    console.error('[v0] Error analyzing job description:', error);
    return Response.json(
      { error: error.message || 'Failed to analyze job description' },
      { status: 500 }
    );
  }
}
