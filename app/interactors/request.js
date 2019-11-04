const {
    request: Request,
    request_subject: RequestSubject,
    subject: Subject,
    sequelize,
    Sequelize,
    Sequelize: { Op }
  } = require('../models'),
  { approved, rejected, withoutEvaluating, consulting } = require('../constants/request');

exports.findRequests = fileId =>
  Request.findAll({
    where: { fk_fileid: fileId },
    include: [{ model: Subject, as: 'originSubjects' }, { model: Subject, as: 'unqSubject' }]
  });

exports.updateRequest = (id, { equivalence, observations }, signature) =>
  Request.update({ equivalence, signature, observations: observations || '-' }, { where: { id } });

exports.getRequest = id =>
  Request.findOne({
    where: { id },
    include: [{ model: Subject, as: 'originSubjects' }, { model: Subject, as: 'unqSubject' }]
  });

// eslint-disable-next-line camelcase
exports.getSubjectsStepper = ({ id }, subjectId) =>
  Request.findOne({
    where: { id },
    include: [{ model: Subject, as: 'originSubjects', where: { id: subjectId } }]
  });

const generateTotalMatchQuery = (unqSubjectId, fkFileId, universityOrigin, careerOrigin, yearPlanOrigin) => `
  with request_ids_in_match as (
    select distinct(requests.id) from requests, request_subjects, subjects where 
      requests.fk_subjectId = ${unqSubjectId} and 
      requests.fk_fileid != ${fkFileId} and
      request_subjects.request_id = requests.id and 
      request_subjects.subject_id = subjects.id and
      requests.equivalence = '${approved}' and 
      subjects.university = '${universityOrigin}' and subjects.career = '${careerOrigin}' 
      ${yearPlanOrigin ? `and subjects.year_plan = '${yearPlanOrigin}'` : ''}
  ),
  request_ids_out_match as (
    select distinct(requests.id) as id from requests, request_subjects, subjects, request_ids_in_match where
      requests.id = request_ids_in_match.id and
      request_subjects.request_id = requests.id and 
      request_subjects.subject_id = subjects.id and 
      (subjects.university != '${universityOrigin}' or subjects.career != '${careerOrigin}' 
      ${yearPlanOrigin ? `or subjects.year_plan != '${yearPlanOrigin}')` : ')'}
  ), 
  request_match_id as (
    select distinct(requests.id) as id from requests, request_subjects, subjects, request_ids_in_match, request_ids_out_match where
      requests.id = request_ids_in_match.id and
      requests.id != request_ids_out_match.id and
      request_subjects.request_id = requests.id and 
      request_subjects.subject_id = subjects.id limit 1
  )
    select subjects.* from requests, request_subjects, subjects, request_match_id where
      requests.id = request_match_id.id and
      request_subjects.request_id = requests.id and 
      request_subjects.subject_id = subjects.id
`;

exports.findRequestsTotalMatch = ({
  fk_fileid: fkFileId,
  originSubject: { university: universityOrigin, career: careerOrigin, yearPlan: yearPlanOrigin },
  unqSubject: {
    dataValues: { id: unqSubjectId }
  }
}) =>
  sequelize.query(
    generateTotalMatchQuery(unqSubjectId, fkFileId, universityOrigin, careerOrigin, yearPlanOrigin),
    {
      type: Sequelize.QueryTypes.SELECT
    }
  );

exports.findRequestsMatchWithoutYearPlanOrigin = ({
  fk_fileid: fkFileId,
  originSubject: { university: universityOrigin, career: careerOrigin },
  unqSubject: {
    dataValues: { id: unqSubjectId }
  }
}) =>
  sequelize.query(generateTotalMatchQuery(unqSubjectId, fkFileId, universityOrigin, careerOrigin), {
    type: Sequelize.QueryTypes.SELECT
  });

exports.findRequestsMatch = ({
  fk_fileid: fkFileId,
  originSubject: { university: universityOrigin, career: careerOrigin, yearPlan: yearPlanOrigin },
  unqSubject: {
    dataValues: { id: unqSubjectId }
  }
}) =>
  Request.findAll({
    where: {
      fk_fileid: { [Op.ne]: fkFileId },
      equivalence: { [Op.in]: [approved, rejected] }
    },
    include: [
      {
        model: Subject,
        as: 'originSubjects',
        where: {
          university: universityOrigin,
          career: careerOrigin,
          yearPlan: yearPlanOrigin
        }
      },
      {
        model: Subject,
        as: 'unqSubject',
        where: { id: unqSubjectId }
      }
    ],
    limit: 50
  });

exports.findRequestsStepper = fileId =>
  Request.findAll({
    attributes: [['id', 'requestId'], 'equivalence', [Sequelize.col('unqSubject.subject'), 'subjectUnq']],
    raw: true,
    where: { fk_fileid: fileId },
    include: [{ model: Subject, as: 'unqSubject', attributes: [] }]
  });

exports.findRequestsStepperProfessor = (fileId, professorId) =>
  Request.findAll({
    attributes: [['id', 'requestId'], 'equivalence', [Sequelize.col('unqSubject.subject'), 'subjectUnq']],
    raw: true,
    where: { fk_fileid: fileId, professorId, equivalence: consulting },
    include: [{ model: Subject, as: 'unqSubject', attributes: [] }]
  });

exports.findAllRequestsProfessor = (professorId, fileId) =>
  Request.findAll({
    raw: true,
    where: { fk_fileid: fileId, professorId, equivalence: consulting },
    include: [{ model: Subject, as: 'originSubjects' }, { model: Subject, as: 'unqSubject' }]
  });

exports.updateConsultEquivalence = (id, { id: professorId }, { message: commentsToProfessor = 'N/I' }) =>
  Request.update({ professorId, equivalence: consulting, commentsToProfessor }, { where: { id } });

exports.findRequestBySubjectUnqId = (fileId, subjectUnqId) =>
  Request.findOne({ where: { fk_fileid: fileId, fk_subjectid: subjectUnqId } });

exports.updateToWithoutEvaluating = request =>
  Request.update(
    { equivalence: withoutEvaluating, signature: 'N/I' },
    { where: { id: request.id }, returning: true }
  );

exports.createRequest = (fileId, subjectUnqId) =>
  Request.create({ fk_fileid: fileId, fk_subjectid: subjectUnqId });

exports.createRequestSubject = (requestId, subjectId) => RequestSubject.create({ requestId, subjectId });
