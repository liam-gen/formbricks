import { SurveyAnalysisNavigation } from "@/app/(app)/environments/[environmentId]/surveys/[surveyId]/(analysis)/components/SurveyAnalysisNavigation";
import { SummaryPage } from "@/app/(app)/environments/[environmentId]/surveys/[surveyId]/(analysis)/summary/components/SummaryPage";
import { SurveyAnalysisCTA } from "@/app/(app)/environments/[environmentId]/surveys/[surveyId]/(analysis)/summary/components/SurveyAnalysisCTA";
import { DEFAULT_LOCALE, DOCUMENTS_PER_PAGE, WEBAPP_URL } from "@/lib/constants";
import { getSurveyDomain } from "@/lib/getSurveyUrl";
import { getResponseCountBySurveyId } from "@/lib/response/service";
import { getSurvey } from "@/lib/survey/service";
import { getUser } from "@/lib/user/service";
import { getEnvironmentAuth } from "@/modules/environments/lib/utils";
import { PageContentWrapper } from "@/modules/ui/components/page-content-wrapper";
import { PageHeader } from "@/modules/ui/components/page-header";
import { SettingsId } from "@/modules/ui/components/settings-id";
import { getTranslate } from "@/tolgee/server";
import { notFound } from "next/navigation";

const SurveyPage = async (props: { params: Promise<{ environmentId: string; surveyId: string }> }) => {
  const params = await props.params;
  const t = await getTranslate();

  const { session, environment, isReadOnly } = await getEnvironmentAuth(params.environmentId);

  const surveyId = params.surveyId;

  if (!surveyId) {
    return notFound();
  }

  const survey = await getSurvey(params.surveyId);

  if (!survey) {
    throw new Error(t("common.survey_not_found"));
  }

  const user = await getUser(session.user.id);

  if (!user) {
    throw new Error(t("common.user_not_found"));
  }

  const totalResponseCount = await getResponseCountBySurveyId(params.surveyId);

  // I took this out cause it's cloud only right?
  // const { active: isEnterpriseEdition } = await getEnterpriseLicense();

  const surveyDomain = getSurveyDomain();

  return (
    <PageContentWrapper>
      <PageHeader
        pageTitle={survey.name}
        cta={
          <SurveyAnalysisCTA
            environment={environment}
            survey={survey}
            isReadOnly={isReadOnly}
            user={user}
            surveyDomain={surveyDomain}
            responseCount={totalResponseCount}
          />
        }>
        <SurveyAnalysisNavigation
          environmentId={environment.id}
          survey={survey}
          activeId="summary"
          initialTotalResponseCount={totalResponseCount}
        />
      </PageHeader>
      <SummaryPage
        environment={environment}
        survey={survey}
        surveyId={params.surveyId}
        webAppUrl={WEBAPP_URL}
        user={user}
        totalResponseCount={totalResponseCount}
        documentsPerPage={DOCUMENTS_PER_PAGE}
        isReadOnly={isReadOnly}
        locale={user.locale ?? DEFAULT_LOCALE}
      />

      <SettingsId title={t("common.survey_id")} id={surveyId}></SettingsId>
    </PageContentWrapper>
  );
};

export default SurveyPage;
