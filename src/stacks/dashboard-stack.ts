import {
  Dashboard,
  GraphWidget,
  GraphWidgetView,
  LegendPosition,
  LogQueryWidget,
  MathExpression,
} from '@aws-cdk/aws-cloudwatch';
import { IFunction } from '@aws-cdk/aws-lambda';
import { Construct, Duration, Stack, StackProps } from '@aws-cdk/core';

export interface DashboardStackProps extends StackProps {
  stage: string;
  lambdaFunctions: IFunction[];
}

export class DashboardStack extends Stack {
  constructor(scope: Construct, id: string, props: DashboardStackProps) {
    super(scope, id, props);

    const dashboardName = `Dashboard-${props.stage}`;

    const dashboard = new Dashboard(this, 'Dashboard', {
      dashboardName,
      start: '-PT3H',
    });

    const period = Duration.minutes(5);

    const lambdaErrorsWidget = new GraphWidget({
      liveData: false,
      stacked: false,
      view: GraphWidgetView.TIME_SERIES,
      legendPosition: LegendPosition.BOTTOM,
      title: 'Lambda Health',
      left: this.buildLambdaMetricsLeft(props.lambdaFunctions),
      leftYAxis: {
        min: 0,
        label: 'Total Error Count',
        showUnits: false,
      },
      right: this.buildLambdaMetricsRight(props.lambdaFunctions),
      rightYAxis: {
        min: 0,
        max: 100,
        label: 'Success Rate %',
        showUnits: false,
      },
      period,
      width: 12,
      height: 6,
    });

    dashboard.addWidgets(lambdaErrorsWidget);

    const warningLogs = new LogQueryWidget({
      logGroupNames: props.lambdaFunctions!.map((func) => {
        return `/aws/lambda/${func.functionName}`;
      }),
      width: 12,
      height: 12,
      queryLines: ['fields @timestamp, @message', "filter level = 'warn'", 'stats count(*) by msg, metricName'],
      title: 'Log Warnings',
    });
    dashboard.addWidgets(warningLogs);
  }

  buildLambdaMetricsLeft(lambdaFunctions: IFunction[]) {
    const errors = lambdaFunctions.map((func) => {
      return func.metricErrors();
    });

    return [...errors];
  }

  buildLambdaMetricsRight(lambdaFunctions: IFunction[]) {
    const successPercentage = lambdaFunctions.map((func, idx) => {
      const errorsName = `errors${idx}`;
      const invocationsName = `invocations${idx}`;
      return new MathExpression({
        label: `${func.functionName} Success %`,
        expression: `100 - 100 * ${errorsName} / MAX([${errorsName}, ${invocationsName}])`,
        usingMetrics: {
          [errorsName]: func.metricErrors(),
          [invocationsName]: func.metricInvocations(),
        },
      });
    });

    return [...successPercentage];
  }
}
